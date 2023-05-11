import React, {
  useEffect, useState, useMemo, useCallback, useRef, useContext,
} from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import {
  Card,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField, List,
  ListItemText,
  ListItemButton,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import Places from './places';
import '../../styles/mapstyles.css';
import UserContext from '../../hooks/Context';
import PlaceViewer from './PlaceViewer';
import { Place } from '../../typings/types';

type LatLngLiteral = google.maps.LatLngLiteral;
type MapOptions = google.maps.MapOptions;

function ReadingSpotsMap() {
  const [latlng, setLatLng] = useState<LatLngLiteral>();
  const [location, setLocation] = useState<string>('');
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [placeId, setPlaceId] = useState<string>('ChIJZYIRslSkIIYRtNMiXuhbBts');
  const [userPlaces, setUserPlaces] = useState<Place[]>([]);

  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const id = user?.id;

  const mapRef = useRef<GoogleMap>();
  const center = useMemo<LatLngLiteral>(() => ({ lat: 29.9511, lng: -90.0715 }), []);
  const options = useMemo<MapOptions>(() => ({
    mapId: '89f1db752bd023d1',
    disableDefaultUI: true,
    clickableIcons: true,
  }), []);

  const onLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  const handlePlaceClick = useCallback((placeId: number, place: any) => {
    const { googlePlaceId } = place;
    setPlaceId(googlePlaceId);
    setSelectedPlace((prev) => (prev === placeId ? null : placeId));
    setIsFormOpen(false);
    setIsAddingDescription(false);
  }, []);

  const handleCardClick = useCallback((lat: number, lng: number, place: any) => {
    setPlaceId(place.googlePlaceId);
    mapRef.current?.panTo({ lat, lng });
  }, []);

  const handleFormOpen = () => {
    setIsFormOpen(true);
    setIsAddingDescription(true);
    setOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setIsAddingDescription(false);
    setShowInfoWindow(false);
  };

  const fetchSavedPlaces = useCallback(async () => {
    try {
      const response = await axios.get('/api/places-to-read');
      setSavedPlaces(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleMarkerClick = useCallback(() => {
    setShowInfoWindow((prev) => !prev);
    fetchSavedPlaces();
  }, []);

  useEffect(() => {
    setDescription('');
    fetchSavedPlaces();
  }, [selectedPlace, fetchSavedPlaces]);

  return (
    <>
      <style>
        {`
          html,
          body {
            overflow: hidden;
          }
        `}
      </style>
      <div className="spots-container">
        <div className="controls">
          <h2 className="favorite-header">What&apos;s your favorite reading spot?</h2>
          <Places
            setLatLng={(position: any) => {
              setLatLng(position);
              mapRef.current?.panTo(position);
            }}
            setLocation={setLocation}
            setPlaceId={setPlaceId}
          />
          <h3 className="top-spots-header">Top Spots</h3>
          <List className="cards-container">
            {savedPlaces?.map((place) => (

              <ListItemButton
                key={place.id}
                onClick={() => handleCardClick(place.Lat, place.Long, place)}
                sx={{
                  border: '1px solid #ccc',
                  bgcolor: '#f0f0f0',
                  borderRadius: '4px',
                  '&:hover': {
                    bgcolor: '#ddd',
                  },
                }}
              >
                <ListItemText primary={(
                  <Typography gutterBottom variant="body1" color="text.secondary">
                    {place.name}
                    {place.location}
                  </Typography>
)}
                />
              </ListItemButton>
            ))}
          </List>
        </div>
        <div className="main-content">
          <div className="place-viewer">
            { placeId
          && <PlaceViewer placeId={placeId} savedPlaces={savedPlaces} />}
          </div>
          <div className="spots-map">
            <GoogleMap
              zoom={11.5}
              center={center}
              mapContainerClassName="map-container"
              options={options}
              onLoad={onLoad}
            >
              {latlng && (
              <Marker
                position={latlng}
                onClick={handleMarkerClick}
                icon={{
                  url: 'http://maps.google.com/mapfiles/kml/shapes/library_maps.png',
                }}
              >
                {showInfoWindow && (
                  <InfoWindow
                    onCloseClick={handleMarkerClick}
                    position={latlng}
                    options={{ maxWidth: 250 }}
                  >
                    <div>
                      <div className="location">{location}</div>
                      <div>
                        {!isAddingDescription && (
                          <Button onClick={handleFormOpen}>Add Review</Button>
                        )}
                        {isFormOpen && (
                          <Card>
                            <Dialog
                              open={open}
                              fullWidth
                              maxWidth="md"
                            >
                              <DialogTitle>Leave This Spot a Review</DialogTitle>
                              <DialogContent>
                                <TextField
                                  autoFocus
                                  margin="dense"
                                  label="Description"
                                  fullWidth
                                  variant="outlined"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                />
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleFormCancel}>Cancel</Button>
                                {/* <Button onClick={handleFormSubmit}>Save</Button> */}
                              </DialogActions>
                            </Dialog>
                          </Card>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
              )}
              {savedPlaces?.map((place) => (
                <Marker
                  key={place.id}
                // position={new google.maps.LatLng(place.Lat, place.Long)}
                  position={{ lat: place.Lat, lng: place.Long }}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/kml/shapes/library_maps.png',
                  }}
                  onClick={() => handlePlaceClick(place.id, place)}
                >
                  {selectedPlace === place.id && (
                  <InfoWindow
                    onCloseClick={() => setSelectedPlace(null)}
                    position={{ lat: place.Lat, lng: place.Long }}
                    options={{ maxWidth: 250 }}
                  >
                    <div>
                      <div className="location">{place.Location}</div>
                      {place.Description_Places && place.Description_Places.length > 0 && <div className="description">{place.Description_Places[0].body}</div>}
                      <div>
                        {!isAddingDescription && (
                          <Button onClick={handleFormOpen}>Add Review</Button>
                        )}
                        {isFormOpen && (
                          <Card>
                            <Dialog
                              open={open}
                              fullWidth
                              maxWidth="md"
                            >
                              <DialogTitle>Leave This Spot a Review</DialogTitle>
                              <DialogContent>
                                <TextField
                                  autoFocus
                                  margin="dense"
                                  label="Description"
                                  fullWidth
                                  variant="outlined"
                                  value={description}
                                  onChange={(e) => setDescription(e.target.value)}
                                />
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleFormCancel}>Cancel</Button>
                                {/* <Button onClick={handleFormSubmit}>Save</Button> */}
                              </DialogActions>
                            </Dialog>
                          </Card>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                  )}
                </Marker>
              ))}
            </GoogleMap>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReadingSpotsMap;
