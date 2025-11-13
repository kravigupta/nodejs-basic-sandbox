{
"targets": [
{
"target_name": "python_bridge",
"sources": [
"src/python_bridge.cc"
],
"include_dirs": [
'<!(python3 -c "import sysconfig; print(sysconfig.get_path(\'include\'))")',
'<!(node -e "console.log(require(\'path\').dirname(require.resolve(\'node-addon-api\')))")',
],
"libraries": [
'<!(python3 -c "import sysconfig; print(\'-L\' + sysconfig.get_config_var(\'LIBDIR\') + \' -lpython\' + sysconfig.get_config_var(\'VERSION\').replace(\'.\', \'\'))")',
],
"defines": [
    "NODE_ADDON_API_CPP_EXCEPTIONS"
],
"cflags_cc": [ 
    "-fexceptions", 
    "-std=c++20" 
],
"cflags_cc!": [ "-fno-exceptions" ],

"conditions": [
    ['OS=="mac"', {
        "ldflags": [ 
            "-rpath", 
            "/opt/homebrew/Caskroom/miniforge/base/envs/p310/lib",
            "-headerpad_max_install_names"
        ],
        "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "CLANG_CXX_LANGUAGE_STANDARD": "c++20",
            "OTHER_CPLUSPLUSFLAGS": [ "-fexceptions" ]
        }
    }],
    ['OS=="win"', {
        'defines': [
            'NAPI_VERSION=6'
        ],
        "msvs_settings": {
            "VCCLCompilerTool": {
                "ExceptionHandling": 1,
                "AdditionalOptions": [ "/std:c++20" ]
            }
        }
    }]
]
}
]
}