# Node-gype Setup

This document provides instructions on how to set up `node-gyp` for building native Node.js addons. It covers the installation of necessary tools and dependencies across different operating systems.

The required files `binding.gyp` and `src/python_bridge.cc` are included in the project repository. Please refer to them for the complete configuration and source code.

## Steps

1. node-addon-api Installation

   Ensure you have `node-addon-api` installed as a dependency in your project:

   ```bash
   npm install node-addon-api
   ```
2. `node-gyp` Installation

   Install `node-gyp` globally if you haven't already:

   ```bash
   npm install -g node-gyp
   ```
3. Build the Addon

   Use `node-gyp` to configure and build the addon:

   ```bash
   node-gyp clean
   node-gyp configure
   ```

   After configuring, check build/python_bridge.target.mk to ensure the paths are correct - specially python

   ```bash
   LIBS := \
	-L/opt/homebrew/Caskroom/miniforge/base/envs/p310/lib -lpython3.10
    ```
    
    Then build the addon:
    
    ```bash
    node-gyp build
    ```
4. Verify the Build
    After building, verify that the addon is correctly linked to the Python library:
    
    ```bash
    otool -L build/Release/python_bridge.node
    ```
    
    You should see an output similar to:
    
    ```
    build/Release/python_bridge.node:
              /opt/homebrew/Caskroom/miniforge/base/envs/p310/lib/libpython3.10.dylib (compatibility version 3.10.0, current version 3.10.0)
              @rpath/libc++.1.dylib (compatibility version 1.0.0, current version 1.0.0)
              /usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1356.0.0)
    ```

    If the Python library path is not correctly set, you may need to adjust the RPATH using `install_name_tool`:
    ```
    install_name_tool -change @rpath/libpython3.10.dylib /opt/homebrew/Caskroom/miniforge/base/envs/p310/lib/libpython3.10.dylib build/Release/python_bridge.node
    ```

    If the C++ standard library path is not correctly set, you may need to adjust it as well:
    ```
    install_name_tool -change @rpath/libc++.1.dylib /usr/lib/libc++.1.dylib build/Release/python_bridge.node
    ```

    After making these changes, verify again with `otool -L` to ensure the paths are correct.
    ```bash
    otool -L build/Release/python_bridge.node
    ```
    You should see an output similar to:
    
    ```
    build/Release/python_bridge.node:
              /opt/homebrew/Caskroom/miniforge/base/envs/p310/lib/libpython3.10.dylib (compatibility version 3.10.0, current version 3.10.0)
              /usr/lib/libc++.1.dylib (compatibility version 1.0.0, current version 1.0.0)
              /usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1356.0.0)
    ``` 

5. Usage

   You can now use the built addon in your Node.js application:

   ```javascript
   const pythonBridge = require('./build/Release/python_bridge.node');
   // Use the pythonBridge module as needed
   ```

   Run your Node.js application to ensure everything is working correctly.
    ```bash
    ts-node src/sandbox-using-cpp-binding.ts
    ```