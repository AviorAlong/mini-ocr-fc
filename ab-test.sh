#!/bin/bash
cnum=(300 500)
# url=http://127.0.0.1:3000/accurate

url=https://1613606417303976.cn-huhehaote.fc.aliyuncs.com/2016-08-15/proxy/serverless-hello-world/accurate/ 
for i in ${cnum[@]};
do
	echo -------$i c start---------
	abs -c $i -n 1000 -p 'base64image' -T 'application/x-www-form-urlencoded' -w $url > ./abtest/ab$i.html
	echo -------$i c end---------
done
