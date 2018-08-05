# OpenCV.js face detection


## Run

因为浏览器安全限制，只能是通过https来访问才行，所以，使用http-server来创建https服务器
我直接也直接创建了一个证书，可以试试能不能直接用。
```
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
http-server -S -C cert.pem -o
```

