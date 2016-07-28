#!/bin/sh

ver="18.48.477.13"

if [ -f "../../android/app/libs/xwalk_core_library-${ver}.aar" ]  && [ -f "libs/xwalk_core_library-${ver}.aar" ];
then
  echo "Cross walk library already exists, skipping download..."
else
  echo "Fetching library for crosswalk..."
  wget https://download.01.org/crosswalk/releases/crosswalk/android/maven2/org/xwalk/xwalk_core_library/${ver}/xwalk_core_library-${ver}.aar
  unzip -j xwalk_core_library-${ver}.aar classes.jar
  zip -d classes.jar javax\*
  zip -r xwalk_core_library-${ver}.aar classes.jar
  rm -f classes.jar
  mv xwalk_core_library-${ver}.aar libs/
  mkdir -p ../../android/app/libs/
  cp libs/xwalk_core_library-${ver}.aar ../../android/app/libs/
fi

