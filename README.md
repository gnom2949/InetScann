# InetScann

## Installation
**InetScann** / Internet Scanner is a scanner that helps you scan YOUR network. It's a web-based tool rather than a website, as InetScann CAN ONLY RUN ON YOUR LOCAL NETWORK using Docker or Linux. So, how do you run it on your local PC? I recommend using Docker.
`1st.` Clone this repo
```
git clone https://github.com/gnom2949/InetScann.git ~/
```

On **windows** it is very easy, you should install a [docker desktop](https://docks.docker.com/desktop), open it. 
Then open **Powershell** and type
```powershell
   cd ~/InetScann
    # 1. Create the Macvlan network (allows LAN access)
    # Note: Check if 192.168.0.0/24 matches your router's subnet!
    docker network create -d macvlan --subnet=192.168.0.0/24 --gateway=192.168.0.1 -o parent=eth0 macvlan0

    # build docker image, if you from russia you should change default repo's to  repo 
    docker build
    # start within docker compose
    docker compose up -d
    # voila! You started the container! But needed to set up some DB's
    docker exec -it inet_scann_app php imoui.php
    docker exec -it inet_scann_app php imcve.php
```
Congrats! We start this container!

Go to the `http://localhost:8092` and start use this utility!

On **linux** It maybe on small percent difficult but not too much.
I'm showing this on Debian using the apt package manager, but the process may differ on Alpine, ArchLinux, and RHEL-based distributions.

```shell
# Install Docker
sudo apt update && sudo apt install -y ca-certificates curl gnupg2 software-properties-common
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER

# Setup Network & Launch
docker network create -d macvlan --subnet=192.168.0.0/24 --gateway=192.168.0.1 -o parent=eth0 macvlan0
docker compose up -d --build
docker exec -it inet_scann_app php imoui.php
docker exec -it inet_scann_app php imcve.php
```


**Complete!** You finally ended the setup!

[Open this](http://localhost:8092)

## Using with URL
To use InetScann with url you need to know,
call ONLY with /api/api.php?action={filename without .php}

#### Example
I want to call module `ping.php`, and i type in browser
`localhost:8092/api/api.php?action=ping` but ping returns answer in JSON.

```json
{
    "ping": "No ip provided"
}
```

Because you don't specify the IP address, to solve this you
have to specify `&ip=127.0.0.1`, full query: `localhost:8092/api/api.php?action=ping&ip=127.0.0.1`, [Test this](localhost:8092/api/api.php?action=ping&ip=127.0.0.1) 

In different files, the target may have a different name, as example: scan.php, this endpoint requires a `target` then `ip`, console requires a `cmd`, cves requires a `id`, mac requires a `mac`, etc.


## Architecture
InetScann uses an multi-layer architecture, frontend/\api/\backend/\DB.

API there a main, because the api proceed the queries


## API
This is a 'heart' of utility, it proceed the queries, and call to Response and Router php scripts.

### A little about interaction with API

How we already now, API is a main component but he not alone

Router is the file that manages the endpoints it has a class called `Router`, but you won't really need it as it only contains a construct and a handle.

That you really needs, the `Response` - He can send mini-JSON messages and he already own Class Response.

#### Usage of Response
So we learn about Router and Response, but how to use it?

So start you needed to **require** the Response.php, i do it in the same dir: `require_once __DIR__ . '/Response.php';`

So to work with, you need to know how to work with classes(PHP 7+), We use an alone-object
`Response::action`

Actions we have in the Response 
| Action | Fully action | Description |
| :---: | ---: | ---: |
| json | Response::json ($data)  | Answer in json format, uses JSON_UNESCAPED_UNICODE, JSON_PRETTY_PRINT, JSON_UNESCAPED_SLASHES |
| error | Response::error ($msg, $code) | An error in json format, needed to specify a message "" and http error code for example 404 |
| ok  | Response::ok ($data) | Just ok response in json format with data, and by default send a 200 http code |
| stream | Response::stream ($data) | Must be used in streams where stream cannot be ended because this function only clear php buffer another functions user exit, what contributes to the stream end |

### And one more component: Writer
Writer is a logger written on php, it uses php://stdout for compactability

#### Basic use

First we need to initialize logger, so it use singleton-patter, to initialize it we use `$write = Writer::getInstance();` -> With that method we getting Instance but we needs in `append` function: `$write->append()` but our output be a only-color: white, to use colors (defined in writer.php) we use function `colorify`: `$write->colorify()` but if you want to set an another color on another phrase in brackets you can set it!: `$write->colorify(['SOMEPHRASE' => '\033[42;1m'])` but use ASCII color codes.

So we initialized writer, how to print message?

To print message we must be use this method: `$write->modulename->info ("USER Registry successfully complete")`, but you can print messages by legacy method: `$write->writeLog ('WARNING', "User login attemps too big $attC")`.

#### Deep use

So we covered the basic usage.

By default args, writer write logs at logs dir(if it not exists, writer create it in dir from he started) and to console.

If you want to write only in file, you can, just change boolean arg in `append`: `$write->append (null, null, false)`.

If you want write logs in the your own dir, just specify the PATH : `$write->append (null, '/var/www/logs', false)`.

But if needed **more** writers, you can use this method:
```php
$fileo = fopen ("log4.log", "a");
$files = fopen ("log3.log", "a");
$write->addWriter ("w1", $fileo);
$write->addWriter ("w2", $files, true, false);
```

And directly call:
```php
$write->writeLog ('ALERT', "SERVER NOT RESPONDING ON PING"); // yea the same as Legacy
```

## Frontend

In frontend we have an `API` **Wrapper**, [see the source](/src/frontend/src/api.ts).

**Shortly** how it works.

In `api.ts` we have an constant `API_WRAP` (analogue #define from C).

And within async function we call this in another constant called `res`.

Like this: `const res = '${API_WRAP}?${query}`(in string type).

To do queries with api function we need to import this: `import { api } from './api'`.

Now we can create a constants, for example hbm: `const hbm = await api ("action", { target });`.

So in field **action** we provide an name of endpoint without .php, in field **target** we provide the query what we need, for example `mac`.

So on this data TypeScript do the query on apache, it looks like this: `http://localhost:8092/api/api.php?action=vendor&mac=286FB9`.

**Tip** You need an async function to use api!

### Logs
To do logs in file, we need a async function called `TypeLog`.

If you seen the api source, you saw it.

But it a just endpoint called `log.php`, api do query, api on php getting this and proceed this, do query on writer and he write to the file(or another options).

#### How to use it

First you needed an async function because TypeLog is an async function.

Second, Import this: `import { api, TypeLog } from './api'`.

So we have three fields.

| Field  |  What he do |
| :--- | ---: |
| Module | Just module, can be only in ' '. |
| Message | This is a message what we want to type. |
| Ctx | This is a context if it exists, you can add this. |

See the example:

```TypeScript
await TypeLog ('info', "Initializing an XTerm.js",  {process });
```

## TS to JS

By default you start this with already compiled TS, but if you add you own feature, you can compile this with **Bun**.

### Instalation

First, go to the [Bun website](https://bun.com) and follow instructions for install it.

Second, Compile it.
```bash
    #first cd to src
    cd ~/InetScann/src

    # compile
    bun build frontend/src/*.ts --outdir dist
```