"use client";
import { MapContainer, TileLayer, Circle, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
let access_points = require("../access_points.json");

export default function Home() {
  function reduceAPs() {
    let reduced = [];
    for (let i = 0; i < access_points.length; i++) {
      reduced.push({
        lat: access_points[i].location.latitude,
        lon: access_points[i].location.longitude,
        name: access_points[i].identification.name,
      });
    }
    return reduced;
  }

  type AccessPoint = {
    lat: number;
    lon: number;
    name: string;
  };

  function createAntennas() {
    let antennas = reduceAPs();
    return antennas.map((antenna: AccessPoint) => (
      // circle
      <Circle
        center={[antenna.lat, antenna.lon]}
        radius={100}
        color="red"
        fillOpacity={0.5}
        key={antenna.name}
      >
        <Popup>{antenna.name}</Popup>
      </Circle>
    ));
  }

  return (
    <>
      <MapContainer
        style={{
          height: 800,
          margin: 10,
          padding: 0,
          borderRadius: 10,
          border: "4px solid black",
          boxShadow: "0 0 20px #ccc",
        }}
        center={[40.73061, -73.935242]}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {createAntennas()}
      </MapContainer>
    </>
  );
}
