const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const fetch = require("node-fetch");
const User = require("../models/User");
const { itineraryValidation } = require("../validation");

// All itineriaries
router.get("/", verify, async (req, res, next) => {
  user = await User.findById({ _id: req.user._id }); // process.env.PLACES_API_KEY
  res.send("List of itineraries for " + user.first_name);
});

// Single itinerary
router.get("/:itineraryId", verify, async (req, res, next) => {
  user = await User.findById({ _id: req.user._id }); // process.env.PLACES_API_KEY
  itineraryId = req.params.itineraryId;
  res.send(itineraryId + " Single for " + user.first_name);
});

// CREATE ITINERARY
router.post("/create", verify, async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Validate Data
  const { error } = itineraryValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Convert Location to Coordinates
  const locationArray = req.body.location.split(" ");
  let locationQueryString = "";
  for (let i = 0; i < locationArray.length; i++) {
    locationQueryString += locationArray[i];
    if (i != locationArray.length - 1) {
      locationQueryString += "+";
    }
  }
  const coordinates = await fetch(
    "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      locationQueryString +
      "&region=uk&key=" +
      process.env.PLACES_API_KEY
  )
    .then((res) => res.json())
    .then((json) =>
      JSON.stringify(json.results[0].geometry.location.lat).concat(
        ",",
        JSON.stringify(json.results[0].geometry.location.lng)
      )
    )
    .catch((err) => console.error(err));

  // Determine search parameters
  const location = coordinates;
  const budget = req.body.budget;
  const duration = req.body.duration;
  const radius = req.body.radius; // Metres

  // Additional Filters
  const accommodation = req.body.accommodation;
  const food = req.body.food;
  const daylife = req.body.daylife;
  const nightlife = req.body.nightlife;

  // Places Types
  const accommodationTypes = ["lodging"];
  const foodTypes = ["food", "cafe", "restaurant"];
  const daylifeTypes = [
    "amusement_park",
    "aquarium",
    "art_gallery",
    "park",
    "museum",
    "tourist_attraction",
    "zoo",
  ];
  const nightlifeTypes = ["bar", "night_club"];

  // Itinerary Array
  let itineraryArray = {};

  // ACCOMMODATION
  if (accommodation == true) {
    chosenAccommodation = await getPlace(location, radius, accommodationTypes);
  }

  // Generate Daily Activities
  for (let i = 1; i < duration + 1; i++) {
    if (food == true) {
      chosenFood = await getPlace(location, radius, foodTypes);
    }

    if (daylife == true) {
      chosenDaylife = await getPlace(location, radius, daylifeTypes);
    }

    if (nightlife == true) {
      chosenNightlife = await getPlace(location, radius, nightlifeTypes);
    }
    itineraryArray[i] = {
      accommodation: chosenAccommodation,
      food: chosenFood,
      daylife: chosenDaylife,
      nightlife: chosenNightlife,
    };
  }

  res.send(itineraryArray);
});

async function getPlace(location, radius, typeArray) {
  const placeArray = await fetch(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" +
      location +
      "&radius=" +
      radius +
      "&type=" +
      typeArray[Math.floor(Math.random() * typeArray.length)] +
      "&key=" +
      process.env.PLACES_API_KEY
  )
    .then((res) => res.json())
    .then((json) => json)
    .catch((err) => console.error(err));
  if (placeArray.status == "ZERO_RESULTS") {
    getPlace(location, radius, typeArray); // TODO add failsafe in case of no places found
  }
  const chosenPlace =
    placeArray.results[Math.floor(Math.random() * placeArray.results.length)];
  return chosenPlace;
}

module.exports = router;
