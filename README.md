# NYCMesh Node Visualizer
[![codecov](https://codecov.io/gh/stevensblueprint/nycmesh-node-visualizer/graph/badge.svg?token=91LC3ME00H)](https://codecov.io/gh/stevensblueprint/nycmesh-node-visualizer)
## Description

NYCMesh is a community-driven, decentralized wireless network initiative based in New York City. It aims to provide affordable and accessible internet connectivity to residents and businesses by creating a mesh network. In a mesh network, individual nodes (routers) connect to each other, forming a web-like structure that can transmit data across the network without relying solely on traditional Internet service providers (ISPs).

This application will provide means for NYCMesh to manage it's wireless sectors that are being used to transport data across city blocks. The main feature of the application is to display a map of NYC that show the different routers NYCMesh manage. The web application will also plot the sector coverage (lobe shaped) of each router to assist NYCMesh in visualizing potential interference and plan for network maintenance/expansions.

## How to contribute
Download the repo by running
```
git clone https://github.com/stevensblueprint/nycmesh-node-visualizer.git
```
Create a new branch. Follow the conventions to name your branch. ex
```
git checkout -b feature/name_of_feature
```
Make your changes and add your changes:
```
git add {modified_file}
```
Commit your changes 
```
git commit -m "Commit message"
```
Push your changes
```
git push --set-upstream origin {branch_name}
```
Submit a pr.


## How to run the application
To run the application:
- Make sure you have ```.env file``` in your src directory. (Note: ```.env.example``` will not work). You can rename ```.env.example``` to ```.env``` for local development. Do not push your .env file
- Initialize the docker deamon. In mac and windows the docker deamon will start when you open the Docker desktop app.
- Initialize docker
```
docker-compose up
```
- Initialize the application
```
npm run dev
```
- When ever you are done using the application run:
```
docker-compose down
```
