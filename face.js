let videoHeight = 667
let videoWidth = 375
let outputCanvas = document.getElementById('outputCanvas');
let ctx = outputCanvas.getContext('2d');
let img = document.getElementById('hat');
let fps = document.getElementById('fps');
let cap = null
let faceCascade = null;
let src = null;
let gray = null;
let st = Date.now();
let last ={};
function run() {

    faceCascade = new cv.CascadeClassifier();
    faceCascade.load('/haarcascade_frontalface_default.xml')

    cap = new cv.VideoCapture(video)
    src = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    gray = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);

    
    if(navigator.userAgent.match(/iPhone/)){
        startIOS();
    }else if(navigator.userAgent.match(/Android/)){
        startAndroid();
    }else {
        startCamera();
    }
   
    requestAnimationFrame(detectFace)

}

function startIOS(){
    let domElement = document.getElementById('video');

    if(navigator.mediaDevices === undefined || navigator.mediaDevices.enumerateDevices === undefined || navigator.mediaDevices.getUserMedia === undefined){
        if(navigator.mediaDevices === undefined){
            var fctName = 'navigator.mediaDevices';
        }
        else if(navigator.mediaDevices.enumerateDevices === undefined){
            var fctName = 'navigator.mediaDevices.enumerateDevices';
        }
        else if(navigator.mediaDevices.getUserMedia === undefined){
            var fctName = 'navigator.mediaDevices.getUserMedia';
        }
        else{
            console.assert(false);
        }
        alert( 'WebRTC issue-! '+fctName+' not present in your browser');
        return null;
    }

    // get available devices
    navigator.mediaDevices.enumerateDevices().then(function(devices){

        var userMediaConstraints = {
            audio: false,
            video: {
                facingMode: 'user',
            }
        }

        // get a device which satisfy the constraints
        navigator.mediaDevices.getUserMedia(userMediaConstraints).then(function success(stream){
            domElement.srcObject = stream;
            document.body.addEventListener('click', function(){
                domElement.play();
            });
            // wait until the video stream is ready
            var interval = setInterval(function(){
                if(!domElement.videoWidth){
                    return;
                }
                // document.body.appendChild(domElement);
                clearInterval(interval);
            }, 1000/50);
        }).catch(function(error){
           alert(error.message);
        });
    }).catch(function(error){
        alert(error.message);
    });
}

function startAndroid(){
    let domElement = document.getElementById('video');
 
    navigator.mediaDevices.getUserMedia({
        'video': {
            facingMode: 'user',
        },
        'audio':false
    }).then(function(stream){
        domElement.srcObject = stream;
        document.body.addEventListener('click', function(){
            domElement.play();
        });
    }).catch( function(err){
        alert(err.message);
    });    //success是获取成功的回调函数


}


async function startCamera() {
    let video = document.getElementById('video');
    navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia;
    navigator.getUserMedia({
        video: {
            width: videoWidth,
            height: videoHeight
        },
        audio: false
    },function(stream){
        video.srcObject = stream;
        video.onloadedmetadata = function(e) {
            video.play();
        };
    },function(err){
        console.log(err);
        alert(JSON.stringify(err))
    })
    // video.srcObject = stream;
    // video.play();
}

function detectFace() {
    // Capture a frame
    cap.read(src)

    // Convert to greyscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);


    // Downsample
    let downSampled = new cv.Mat();
    cv.pyrDown(gray, downSampled);
    cv.pyrDown(downSampled, downSampled);

    // Detect faces
    let faces = new cv.RectVector();
    faceCascade.detectMultiScale(downSampled, faces)

    // Draw boxes
    let size = downSampled.size();
    let xRatio = videoWidth / size.width;
    let yRatio = videoHeight / size.height;
    for (let i = 0; i < faces.size(); ++i) {
        let face = faces.get(i);
        let point1 = new cv.Point(face.x * xRatio, face.y * yRatio);
        let point2 = new cv.Point((face.x + face.width) * xRatio, (face.y + face.height) * xRatio);
        cv.rectangle(src, point1, point2, [255, 0, 0, 255])
    }
    

    // Show image
    cv.imshow(outputCanvas, src)
    
    for (let i = 0; i < faces.size(); ++i) {
        let face = faces.get(i);
        last.x=face.x * xRatio;
        last.y=face.y * yRatio-150;
        last.w = face.width*xRatio;
        last.h = face.width*xRatio;
    }
    ctx.drawImage(img, last.x, last.y, last.w, last.h );

    // Free memory
    downSampled.delete()
    faces.delete()

    var t = Date.now()-st;
    st = Date.now();
    fps.innerHTML= Math.ceil(1000/t);
    
    requestAnimationFrame(detectFace)
}

// Config OpenCV
var Module = {
    locateFile: function (name) {
        let files = {
            'opencv_js.wasm': '/opencv/opencv_js_old.wasm'
        }
        return files[name]
    },
    preRun: [function(){
        Module.FS_createPreloadedFile('/', 'haarcascade_frontalface_default.xml','haarcascade_frontalface_default.xml',true, false);
    }],
    postRun: [
        run
    ]
};

window.onerror=function(msg,url,l)
{
    txt='';
    txt+='Error: ' + msg + '\n';
    txt+='URL: ' + url + '\n';
    txt+='Line: ' + l + '\n\n';
    txt+='Click OK to continue.\n\n';
    alert(txt);
    return true;
};
