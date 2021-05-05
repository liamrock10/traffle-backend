const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const fetch = require("node-fetch");
const User = require("../models/User");
const Itinerary = require("../models/Itinerary");
const Activity = require("../models/Activity");
const { itineraryValidation } = require("../validation");

// All Itineraries
router.get("/", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Get All Itineraries
  allItineraries = await Itinerary.find({ userId: user });
  // Send back Itineraries
  res.send(allItineraries);
});

// Single Itinerary
router.get("/:itineraryId", verify(), async (req, res, next) => {
  // Get Itinerary
  itinerary = await Itinerary.findOne({
    _id: req.params.itineraryId,
    userId: req.user._id,
  });
  // Send back Itinerary
  res.send(itinerary);
});

// All Activities for Itinerary
router.get("/:itineraryId/activities", verify(), async (req, res, next) => {
  // Get Itinerary
  itinerary = await Itinerary.findOne({
    _id: req.params.itineraryId,
    userId: req.user._id,
  });
  // Get All Activities
  allActivities = await Activity.find({ itineraryId: itinerary });
  // Send back All Activities
  res.send(allActivities);
});

// Single Activity for Itinerary
router.get(
  "/:itineraryId/activities/:activityId",
  verify(),
  async (req, res, next) => {
    // Get Itinerary
    itinerary = await Itinerary.findOne({
      _id: req.params.itineraryId,
      userId: req.user._id,
    });
    // Get Activity
    activity = await Activity.findById({
      _id: req.params.activityId,
      itineraryId: itinerary,
    });
    // Send back Activity
    res.send(activity);
  }
);

// DELETE ITINERARY (including all of its activities)
router.delete("/:itineraryId", verify(), async (req, res, next) => {
  // Delete Itinerary
  itinerary = await Itinerary.findOneAndDelete({
    _id: req.params.itineraryId,
    userId: req.user._id,
  });
  // Delete Activities associated to Itinerary
  await Activity.deleteMany({ itineraryId: itinerary });
  // Send back Itinerary
  res.send("Successfully Deleted"); // TODO: decide on response
});

// CREATE ITINERARY
router.post("/create", verify(), async (req, res, next) => {
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
  const foodTypes = ["bar", "food", "cafe", "restaurant"];
  const daylifeTypes = [
    "amusement_park",
    "aquarium",
    "art_gallery",
    "park",
    "museum",
    "tourist_attraction",
    "zoo",
  ];
  const nightlifeTypes = ["night_club"];

  // Itinerary Array
  let itineraryArray = {};

  // Create new Itinerary
  const itinerary = new Itinerary({
    userId: user,
    location: req.body.location,
    coordinates: coordinates,
    budget: budget,
    duration: duration,
    radius: radius,
    activities: [],
  });

  // Save Itinerary
  const savedItinerary = await itinerary.save().catch((e) => {
    res.status(400).send(e);
  });

  // ACCOMMODATION
  if (accommodation == true) {
    // Get Accommodation Activity
    chosenAccommodation = await getPlace(location, radius, accommodationTypes);
    // Zero results
    if (chosenAccommodation == null) {
      // Delete Itinerary
      deletedItinerary = await Itinerary.findOneAndDelete({
        _id: itinerary,
        userId: req.user._id,
      });
      // Delete Activities associated to Itinerary
      await Activity.deleteMany({ itineraryId: deletedItinerary });
      // Send No Results Found Response
      res.status(400).json({
        reason: "No results found, please consider increasing search radius.",
        activityType: "accommodation",
      });
    }
  }

  // Generate Daily Activities
  for (let i = 1; i < duration + 1; i++) {
    if (accommodation == true) {
      // Check if activity place has a photo
      let photoBoolean = true;
      if (chosenAccommodation.photos == undefined) {
        photoBoolean = false;
      }
      // Create Activity
      const accommodationActivity = new Activity({
        itineraryId: savedItinerary,
        day: i,
        type: "accommodation",
        name: chosenAccommodation.name,
        place_id: chosenAccommodation.place_id,
        // price_level: chosenAccommodation.price_level,
        rating: chosenAccommodation.rating,
        // formatted_address: chosenAccommodation.formatted_address,
        photo: photoBoolean
          ? {
              photo_reference: chosenAccommodation.photos[0].photo_reference,
              height: chosenAccommodation.photos[0].height,
              width: chosenAccommodation.photos[0].width,
            }
          : "No photo",
      });
      // Save Accommodation
      const savedAccommodation = await accommodationActivity
        .save()
        .catch((e) => {
          res.status(400).send(e);
        });
    }

    if (food == true) {
      // Get Food Activity
      chosenFood = await getPlace(location, radius, foodTypes);
      // Zero results
      if (chosenFood == null) {
        // Delete Itinerary
        deletedItinerary = await Itinerary.findOneAndDelete({
          _id: itinerary,
          userId: req.user._id,
        });
        // Delete Activities associated to Itinerary
        await Activity.deleteMany({ itineraryId: deletedItinerary });
        // Send No Results Found Response
        res.status(400).json({
          reason: "No results found, please consider increasing search radius.",
          activityType: "food",
        });
      }
      // Check if activity place has a photo
      let photoBoolean = true;
      if (chosenFood.photos == undefined) {
        photoBoolean = false;
      }
      // Create Activity
      const foodActivity = new Activity({
        itineraryId: savedItinerary,
        day: i,
        type: "food",
        name: chosenFood.name,
        place_id: chosenFood.place_id,
        rating: chosenFood.rating,
        photo: photoBoolean
          ? {
              photo_reference: chosenFood.photos[0].photo_reference,
              height: chosenFood.photos[0].height,
              width: chosenFood.photos[0].width,
            }
          : "No photo",
      });
      // Save Food
      const savedFood = await foodActivity.save().catch((e) => {
        res.status(400).send(e);
      });
    }

    if (daylife == true) {
      // Get Daylife Activity
      chosenDaylife = await getPlace(location, radius, daylifeTypes);
      // Zero results
      if (chosenDaylife == null) {
        // Delete Itinerary
        deletedItinerary = await Itinerary.findOneAndDelete({
          _id: itinerary,
          userId: req.user._id,
        });
        // Delete Activities associated to Itinerary
        await Activity.deleteMany({ itineraryId: deletedItinerary });
        // Send No Results Found Response
        res.status(400).json({
          reason: "No results found, please consider increasing search radius.",
          activityType: "daylife",
        });
      }
      // Check if activity place has a photo
      let photoBoolean = true;
      if (chosenDaylife.photos == undefined) {
        photoBoolean = false;
      }
      // Create Activity
      const daylifeActivity = new Activity({
        itineraryId: savedItinerary,
        day: i,
        type: "daylife",
        name: chosenDaylife.name,
        place_id: chosenDaylife.place_id,
        rating: chosenDaylife.rating,
        photo: photoBoolean
          ? {
              photo_reference: chosenDaylife.photos[0].photo_reference,
              height: chosenDaylife.photos[0].height,
              width: chosenDaylife.photos[0].width,
            }
          : "No photo",
      });
      // Save Daylife
      const savedDaylife = await daylifeActivity.save().catch((e) => {
        res.status(400).send(e);
      });
    }

    if (nightlife == true) {
      // Get Nightlife Activity
      chosenNightlife = await getPlace(location, radius, nightlifeTypes);
      // Zero results
      if (chosenNightlife == null) {
        // Delete Itinerary
        deletedItinerary = await Itinerary.findOneAndDelete({
          _id: itinerary,
          userId: req.user._id,
        });
        // Delete Activities associated to Itinerary
        await Activity.deleteMany({ itineraryId: deletedItinerary });
        // Send No Results Found Response
        res.status(400).json({
          reason: "No results found, please consider increasing search radius.",
          activityType: "nightlife",
        });
      }
      // Check if activity place has a photo
      let photoBoolean = true;
      if (chosenNightlife.photos == undefined) {
        photoBoolean = false;
      }
      // Create Activity
      const nightlifeActivity = new Activity({
        itineraryId: savedItinerary,
        day: i,
        type: "nightlife",
        name: chosenNightlife.name,
        place_id: chosenNightlife.place_id,
        rating: chosenNightlife.rating,
        photo: photoBoolean
          ? {
              photo_reference: chosenNightlife.photos[0].photo_reference,
              height: chosenNightlife.photos[0].height,
              width: chosenNightlife.photos[0].width,
            }
          : "No photo",
      });
      // Save Nightlife
      const savedNightlife = await nightlifeActivity.save().catch((e) => {
        res.status(400).send(e);
      });
    }
    // SUCCESSFULLY Created an itinerary!
    res.status(201).send(itinerary._id);
  }
});

async function getPlace(location, radius, typeArray) {
  let resultsArray = [];
  let zeroResultsCount = 0;
  for (let i = 0; i < typeArray.length; i++) {
    console.log(typeArray[i]);
    const placeArray = await fetch(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" +
        location +
        "&radius=" +
        radius +
        "&type=" +
        typeArray[i] +
        "&key=" +
        process.env.PLACES_API_KEY
    )
      .then((res) => res.json())
      .then((json) => json)
      .catch((err) => console.error(err));
    if (placeArray.status == "ZERO_RESULTS") {
      console.log("zero results");
      zeroResultsCount++;
      continue;
    }
    resultsArray = resultsArray.concat(placeArray.results);
  }
  if (zeroResultsCount == typeArray.length) {
    console.log("literally no results");
    return null;
  }
  const chosenPlace =
    resultsArray[Math.floor(Math.random() * resultsArray.length)];
  return chosenPlace;
}

module.exports = router;
