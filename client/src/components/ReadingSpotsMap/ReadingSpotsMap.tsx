import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import Places from "./places";
import axios from "axios";
import "../../styles/mapstyles.css";

type LatLngLiteral = google.maps.LatLngLiteral;
type MapOptions = google.maps.MapOptions;

interface Place {
  id: number;
  Location: string;
  Lat: number;
  Long: number;
}

function ReadingSpotsMap() {
  const [latlng, setLatLng] = useState<LatLngLiteral>();
  // console.log("latlng data", latlng);
  const [address, setAddress] = useState<string>("");
  // console.log("address data", address);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  // console.log("saved places:", savedPlaces);
  // savedPlaces.forEach(place => {
  //   console.log(place.Long);
  // });

  const mapRef = useRef<GoogleMap>()
  const center = useMemo<LatLngLiteral>(() => ({ lat: 29.9511, lng: -90.0715 }), []);
  const options = useMemo<MapOptions>(() => ({
    mapId: "89f1db752bd023d1",
    disableDefaultUI: true,
    clickableIcons: false,
  }), []);

  const onLoad = useCallback((map: any) => (mapRef.current = map), []);

  useEffect(() => {
    const fetchSavedPlaces = async () => {
      const response = await axios.get('/api/places-to-read/places');
      setSavedPlaces(response.data);
    };
    fetchSavedPlaces();
  }, []);

  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedPlace(place);
    // setShowInfoWindow(true);
  }, []);

  const handleInfoWindowClose = useCallback(() => { // NEW HANDLER
    setSelectedPlace(null);
    // setShowInfoWindow(false);
  }, []);

  return (
    <div className="spots-container">
      <div className="controls">
        <h2>Enter your favorite reading spots</h2>
        <Places
          setLatLng={(position: any) => {
            setLatLng(position);
            mapRef.current?.panTo(position);
          }}
          setAddress={setAddress}
        />
      </div>
      <div className="spots-map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {latlng && (
            <Marker
              position={latlng}
              // draggable={true}
              onClick={() => setSelectedPlace(null)}
              icon={{
                url: "http://maps.google.com/mapfiles/kml/shapes/library_maps.png",
              }}
            >
              {showInfoWindow && (
                <InfoWindow
                  onCloseClick={() => setShowInfoWindow(false)}
                  position={latlng}
                  options={{ maxWidth: 150 }}
                >
                  <div>{address}</div>
                </InfoWindow>
              )}
            </Marker>
          )}
          {savedPlaces?.map((place) => (
            <Marker
              key={place.id}
              // position={new google.maps.LatLng(place.lat, place.lng)}
              position={{ lat: place.Lat, lng: place.Long }}
              icon={{
                url: "http://maps.google.com/mapfiles/kml/shapes/library_maps.png",
              }}
              onClick={() => handleMarkerClick(place)}
            >
              {selectedPlace?.id === place.id && ( // NEW: SHOW INFO WINDOW IF THE MARKER'S PLACE IS SELECTED
                <InfoWindow
                  onCloseClick={handleInfoWindowClose}
                  position={{ lat: place.Lat, lng: place.Long }}
                  options={{ maxWidth: 150 }}
                >
                  <div>{place.Location}</div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>
    </div>
  )
}

export default ReadingSpotsMap;