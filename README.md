# Animation of Avatar Face Based on Human Face Video
xtakac07

This project presents an application for animating 3D avatar based on a single camera or video input of human face in real time. 
  The resulting application consists of three modules -- face tracking, avatar animator, and a server for transferring face data. The face tracking module computes new transforms for the animation from human face and benefits from Mediapipe's Facemesh to estimate the current face geometry. 
  Avatar animator module is a web-based application for rendering and animating 3D avatars through skeletal animations, based on the Three.js library. 
  Both modules make use of the continuous bidirectional communication of websockets through the single server.
  Performance of the face tracking module depends on the camera and device on which it is running, but regular web camera is usually enough for speed of `30+` FPS and animation runs at the speed of `60+` FPS with multiple avatars.

<a href="https://youtu.be/NmKobSX5TTI" target="_blank"><img src="http://img.youtube.com/vi/NmKobSX5TTI/0.jpg" 
alt="Demo video of the project" width="240" height="180" border="10" /></a>

## Installation Guide and User Manual
To install the current version of the project, navigate to [my repo](https://github.com/Junacik99/bac) and clone or download the repository. Steps for installing individual modules are explained in the following sections.

### Installing the Websocket Server
To install the websocket server on the device, Python version $3.9.7$ or later is required. Make sure you have the correct version of Python installed using command:
```
python --version
```

If the correct version of Python is already installed, open command line/terminal and navigate to the downloaded repository **bac-main**. Navigate to the **WebSocketServer** directory. From there issue command:
```
pip install -r requirements.txt
```
to install all required dependencies. If the face tracking module was installed before the websocket server, this step can be ignored, because all the dependencies are already installed.

To run the websocket server from the **WebSocketServer** directory, issue command:
```
python websoc.py
```

After starting the server, you should see the message: *Starting websocket server*. This means that the server is running on port `8765` and ready to serve clients. To change the port for the server, open *websoc.py* and change value of *port* to desired port number.


### Installing the Face Tracking Module
To install the face tracking module on the device, Python version `3.9.7` or later is required. Make sure you have the correct version of Python installed using command:
```
python --version
```

If the correct version of Python is already installed, open command line/terminal and navigate to the downloaded project repository **bac-main**. Navigate to the **FaceTracking** directory. From there issue command:
```
pip install -r requirements.txt
```
to install all required dependencies. 

To run the face tracking from the **FaceTracking** directory, issue command:
```
python FaceTracking.py [mode]
```
where `mode` is the optional argument. If `mode` is an integer number (0 or greater), the face tracking module will look for the connected camera with index `mode`. If `mode` is anything else, the face tracking module will take it as a path to the input video file. If loading the video does not work, check the path for any typos and grammar errors, and make sure a proper version of [ffmpeg or gstreamer is installed](https://docs.opencv.org/4.x/dd/d43/tutorial_py_video_display.html).

If there are more than one argument given, the face tracking module will ignore all but the first, which will be consider valid mode.

If no arguments are given, then `0` is a default mode and the face tracking module will try to read input from the default camera.

**Attention!** By default the address and the port of the websocket server are set to `ws://localhost:8765`. To change it, navigate to *ws_client.py* and change the value of `ws_address`.



### Installing the Avatar Animator Module
Avatar animator is already deployed online and publicly available [here](http://www.stud.fit.vutbr.cz/~xtakac07/). No installation is needed, but the websocket server should be running before accessing the avatar animator. By default, it looks for the websocket server on `localhost`, port `8765`. To change it, follow instructions bellow.

To install the avatar animator module on your own device *Three.js* library is required. Visit <https://threejs.org/> and hit the download button. This will automatically start the download of the library.

Extract the downloaded zip file and move it to the **ModelRender** directory of the **bac-main** repository. The **three.js-master** directory should be root directory for **build** and **examples** directories.

To control GUI elements the *dat.gui* library is required. To download *dat.gui* clone the repository from <https://github.com/dataarts/dat.gui>. If you downloaded zip file, extract it. Then the cloned or extracted repository has to be moved to the **ModelRender** directory, so the **dat.gui-master** directory contains **build** directory.

After cloning the repository and inserting *Three.js* and *dat.gui* modules inside **ModelRender** directory, the avatar animator module is ready to be deployed. To this I recommend using Visual Studio Code with [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer). It helps you launch a local server for development.
Alternatively, it is possible to deploy whole **ModelRender** directory on a server, such as <https://www.stud.fit.vutbr.cz> for **VUT FIT** students, to access avatar animator functions.

By default, the avatar animator looks for the websocket server on `localhost`, port `8765`. To change it, open **index.js** script and change value of `ws_address`.

**Disclaimer** I do not own any of the provided assets files and they have been provided to me for free from online markets. Provided assets:
* [Ruby Rose](https://skfb.ly/6QSUK)
* [Old man](https://www.turbosquid.com/3d-models/free-blend-mode-old-man-rigged/625963)
* [Markus](https://www.turbosquid.com/3d-models/free-blend-mode-markus-sculpt/536148)
* [Latifa](https://www.cgtrader.com/free-3d-models/character/woman/latifa-v2-original-vrchat-and-game-ready)
* [Rin](https://www.cgtrader.com/free-3d-models/character/woman/rin-vrc-avatar)
* Pilin
* [Bandit](https://www.turbosquid.com/3d-models/basic-bandit-3d-1250561)

