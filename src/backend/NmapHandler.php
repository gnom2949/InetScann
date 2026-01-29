<?php
namespace Src\Backend\NmHandl;
require __DIR__ . 'vendor/autoload.php';
require 'writeron.php';

use Nmap\Nmap;
use Nmap\Service;
use Nmap\Util;
use Nmap\Arguments;
use Nmap\Exceptions\NmapException;
use Nmap\Port;

	writer()->writer_append();
	writer()->writer_colorify();
	// Функция получения маски подсети(SubNet) через метод execute, работает только c IPv4!!
	function getSubNet ()
	{
		$output = [];
		exec ("ip a show eth0", $output);

		//Поиск строки inet
		$ipL = preg_grep ('/inet\s/', $output);
		if (empty($ipL)) return null; // Ip не найден

		$line = trim (reset($ipL));

		// Извлечение IP и маски
		if (!preg_match ('/inet\s([0-9\.]+)\/([0-9]+)/', $line, $matches)) return null;

        $ip = $matches[1];
        $mask = $matches[2];

        // Вычисление адреса сети
        $ipLong = ip2long ($ip);
        $maskLong = -1 << (32 - $mask);
        $netLong = $ipLong & $maskLong;
        $net = long2ip ($netLong);

        // Возвращение ip
        return $net . '/' . $mask;
	}
	function netAppendScan ($options)
	{
		$nmap = new Nmap();
        $subnet = getSubNet();

		$options['-sL'];
		$nmap
			->enableOsDetection()
			->enableServiceInfo()
			->scan([$subnet]);

        return $nmap;
	}
?>