<?php
// CVE importer from nmap vulners.nse output
// Imports vulnerability data into Redis using redisHndl.php

require_once __DIR__ . '/backend/redisHndl.php';

class VulnersImporter {
    private $redis;
    private $logger;

    public function __construct($redisHandler, $logger = null) {
        $this->redis = $redisHandler;
        $this->logger = $logger;
    }

    /**
     * Parse nmap XML output and extract vulners data
     * @param string $xmlFile Path to nmap XML output file
     * @return array Array of CVE data
     */
    public function parseNmapXML(string $xmlFile): array {
        $cveData = [];

        if (!file_exists($xmlFile)) {
            throw new Exception("File not found: $xmlFile");
        }

        $xml = simplexml_load_file($xmlFile);
        if (!$xml) {
            throw new Exception("Failed to parse XML file");
        }

        // Iterate through hosts and services
        foreach ($xml->host as $host) {
            $hostAddr = (string)$host->address['addr'];

            foreach ($host->ports->port as $port) {
                $portNumber = (int)$port['portid'];
                $portState = (string)$port->state['state'];
                $service = (string)$port->service['name'] ?? 'unknown';

                // Look for vulners script output
                foreach ($port->script as $script) {
                    if ((string)$script['id'] === 'vulners') {
                        $output = (string)$script['output'];
                        $cves = $this->parseVulnersOutput($output, $hostAddr, $portNumber, $service);
                        $cveData = array_merge($cveData, $cves);
                    }
                }
            }
        }

        return $cveData;
    }

    /**
     * Parse vulners script text output
     * Format: CVE-ID    SCORE    URL
     * @param string $output Raw vulners output
     * @param string $host Host IP address
     * @param int $port Port number
     * @param string $service Service name
     * @return array Parsed CVE records
     */
    private function parseVulnersOutput(string $output, string $host, int $port, string $service): array {
        $cves = [];
        $lines = explode("\n", $output);

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Match pattern: CVE-YYYY-NNNNN    SCORE    URL
            if (preg_match('/^(CVE-\d{4}-\d+)\s+(\d+\.?\d*)\s+(https?:\/\/.+)$/', $line, $matches)) {
                $cveId = $matches[1];
                $score = (float)$matches[2];
                $url = $matches[3];

                $cves[] = [
                    'id' => $cveId,
                    'score' => $score,
                    'severity' => $this->getSeverity($score),
                    'url' => $url,
                    'host' => $host,
                    'port' => $port,
                    'service' => $service,
                    'discovered_at' => date('Y-m-d H:i:s'),
                ];
            }
            // Also match EXPLOITPACK format
            elseif (preg_match('/^(EXPLOITPACK:[A-F0-9]+)\s+(\d+\.?\d*)\s+(https?:\/\/.+)$/', $line, $matches)) {
                $exploitId = $matches[1];
                $score = (float)$matches[2];
                $url = $matches[3];

                $cves[] = [
                    'id' => $exploitId,
                    'score' => $score,
                    'severity' => $this->getSeverity($score),
                    'url' => $url,
                    'host' => $host,
                    'port' => $port,
                    'service' => $service,
                    'discovered_at' => date('Y-m-d H:i:s'),
                    'type' => 'exploit',
                ];
            }
        }

        return $cves;
    }

    /**
     * Convert CVSS score to severity level
     * @param float $score CVSS score (0-10)
     * @return string Severity level
     */
    private function getSeverity(float $score): string {
        if ($score >= 9.0) return 'CRITICAL';
        if ($score >= 7.0) return 'HIGH';
        if ($score >= 4.0) return 'MEDIUM';
        if ($score >= 0.1) return 'LOW';
        return 'NONE';
    }

    /**
     * Import CVE data into Redis
     * @param array $cveData Array of CVE records
     * @return int Number of imported CVEs
     */
    public function importCVEs(array $cveData): int {
        $imported = 0;
        $timestamp = time();

        foreach ($cveData as $cve) {
            try {
                $cveId = $cve['id'];
                
                // Store CVE details as hash
                $this->redis->hset("cve:{$cveId}", [
                    'id' => $cveId,
                    'score' => $cve['score'],
                    'severity' => $cve['severity'],
                    'url' => $cve['url'],
                    'host' => $cve['host'],
                    'port' => $cve['port'],
                    'service' => $cve['service'],
                    'discovered_at' => $cve['discovered_at'],
                    'type' => $cve['type'] ?? 'cve',
                ]);

                // Add to sorted set for querying by severity score
                $this->redis->zadd("cve:by_score", [
                    $cve['score'] => $cveId
                ]);

                // Add to sorted set by severity level
                $severityMap = ['CRITICAL' => 4, 'HIGH' => 3, 'MEDIUM' => 2, 'LOW' => 1, 'NONE' => 0];
                $this->redis->zadd("cve:by_severity", [
                    $severityMap[$cve['severity']] => $cveId
                ]);

                // Index by host:port for quick lookup
                $hostPortKey = "{$cve['host']}:{$cve['port']}";
                $this->redis->sadd("vulnerabilities:{$hostPortKey}", $cveId);

                // Set expiration (optional - 30 days)
                $this->redis->expire("cve:{$cveId}", 30 * 24 * 60 * 60);

                $imported++;
            } catch (Exception $ex) {
                $this->log("error", "Error importing CVE {$cveId}: " . $ex->getMessage());
            }
        }

        return $imported;
    }

    /**
     * Get all CVEs for a specific host:port
     * @param string $host IP address
     * @param int $port Port number
     * @return array List of CVE details
     */
    public function getHostVulnerabilities(string $host, int $port): array {
        $hostPortKey = "{$host}:{$port}";
        $cveIds = $this->redis->smembers("vulnerabilities:{$hostPortKey}");
        $vulnerabilities = [];

        foreach ($cveIds as $cveId) {
            $vuln = $this->redis->hgetall("cve:{$cveId}");
            if ($vuln) {
                $vulnerabilities[] = $vuln;
            }
        }

        // Sort by score descending
        usort($vulnerabilities, fn($a, $b) => (float)$b['score'] <=> (float)$a['score']);

        return $vulnerabilities;
    }

    /**
     * Get high/critical CVEs
     * @param float $minScore Minimum CVSS score (default 7.0 for HIGH)
     * @return array Critical/high severity CVEs
     */
    public function getCriticalVulnerabilities(float $minScore = 7.0): array {
        $cveIds = $this->redis->zrangebyscore("cve:by_score", $minScore, '+inf');
        $vulnerabilities = [];

        foreach ($cveIds as $cveId) {
            $vuln = $this->redis->hgetall("cve:{$cveId}");
            if ($vuln) {
                $vulnerabilities[] = $vuln;
            }
        }

        return $vulnerabilities;
    }

    /**
     * Clear all CVE data from Redis
     */
    public function clearCVEs(): void {
        $keys = $this->redis->keys('cve:*');
        $keys = array_merge($keys, $this->redis->keys('vulnerabilities:*'));
        
        if (!empty($keys)) {
            $this->redis->del(...$keys);
        }
    }

    private function log(string $level, string $message, array $context = []): void {
        if ($this->logger) {
            echo "[$level] $message";
            if (!empty($context)) {
                echo " " . json_encode($context);
            }
            echo "\n";
        }
    }
}

// ==================== USAGE EXAMPLE ====================

if (php_sapi_name() === 'cli') {
    try {
        // Initialize logger
        $logger = new class {
            public function info($msg, $data = []) { 
                echo "[INFO] $msg\n"; 
                if ($data) var_dump($data);
            }
            public function error($msg, $data = []) { 
                echo "[ERROR] $msg\n"; 
                if ($data) var_dump($data);
            }
        };

        // Initialize Redis connection
        $redis = redis($logger);

        // Create importer instance
        $importer = new VulnersImporter($redis, true);

        // Option 1: Parse from nmap XML output
        if (isset($argv[1]) && file_exists($argv[1])) {
            echo "Parsing nmap output: {$argv[1]}\n";
            $cveData = $importer->parseNmapXML($argv[1]);
            echo "Found " . count($cveData) . " vulnerabilities\n";

            // Clear existing data (optional)
            // $importer->clearCVEs();

            // Import into Redis
            $imported = $importer->importCVEs($cveData);
            echo "Successfully imported $imported CVEs into Redis\n";

            // Show critical vulnerabilities
            $critical = $importer->getCriticalVulnerabilities(7.0);
            echo "\nCritical/High Vulnerabilities (score >= 7.0): " . count($critical) . "\n";
            foreach ($critical as $cve) {
                echo "  - {$cve['id']} (Score: {$cve['score']}, Host: {$cve['host']}:{$cve['port']})\n";
            }
        } else {
            echo "Usage: php cve_import_vulners.php <nmap_output.xml>\n";
            echo "Example: nmap -sV --script vulners -oX scan.xml target.com\n";
        }

    } catch (Exception $ex) {
        echo "Error: " . $ex->getMessage() . "\n";
        exit(1);
    }
}
?>