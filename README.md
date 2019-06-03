# The CityRunner
This is the final project for CS 174A, Spring 2019.

## Introduction
You are driving in a city that we created. The purpose of the game is for you to drive freely and enjoy the view. However, if you happen to drive into things like buildings, trees, and blocks multiple times or drive off-road frequently, then your vehicle will likely blow up, and you will have to start over. 

## Important Features
* Car control: The car can accelerate, decelerate, and change directions as you wish.
* Collision: You cannot drive through things like buildings, trees, and blocks on the street. If you do run into any one of them, your car will stop and its HP (Health Points) will be deducted accordingly.
* HP bar: There is an HP bar on top of the vehicle indicating its durability. Each time the vehicle runs into obstacles, the HP bar is shortened. If you keep going into the buildings, HP bar will be shortened even more. When HP is depleted, the vehicle will blow up. Game over.
* Camera angles: we implemented first person, third person, and bird's-eye view.

## Technicality
* Shaders: we used sun shader when the car blow up, and customized texture shader for ground, trees, skybox, block signs.
* Physics: we implemented the physics system on the car's transformation ( interation between velocity and acceleration).
* Collision Detection: collision detection among blocks, buildings, the vehicle, and trees.
* Sound: we implemented three sounds: car accelerating, car drifting, and car blowing up.

## Roles
* Yuan Cheng: building models for vehicle, skybox, block signs, trees; sound implementation; README writeup.
<<<<<<< HEAD
* Chenglai Huang: building and incorporating all models into the city (buildings, roads, ground, layout, stop signs, trees, vehicle, acceleration animation).
* Xiao Jiang: building game kinetics and logistic such as HP bar mechanisms and calculation of acceleration, friction, velocity and displacement
=======
* Chenglai Huang: building the city (buildings, roads, layout), merge components to the final version.
* Xiao Jiang: control the movement of the car through calculation of acceleration, friction, velocity and displacement; implemented HP bar.
>>>>>>> 0d94771563bcfc8da48df4b09be54341737d74d2
* Yiwei Liao: building collision detection(with obstacles and off-road detection); explosion; camera follow(FPP,TPP,Bird View); perspective;
