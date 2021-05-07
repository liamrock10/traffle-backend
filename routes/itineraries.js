const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const fetch = require("node-fetch");
const User = require("../models/User");
const Itinerary = require("../models/Itinerary");
const Activity = require("../models/Activity");
const Campaign = require("../models/Campaign");
const geolib = require("geolib");
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

  // Campaign Booleans
  let accommodationCampaign = false;
  let foodCampaign = false;
  let daylifeCampaign = false;
  let nightlifeCampaign = false;
  // Campaign Ids
  let accommodationCampaignId = "";
  let foodCampaignId = "";
  let daylifeCampaignId = "";
  let nightlifeCampaignId = "";

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
    return res.status(400).send(e);
  });

  // ACCOMMODATION
  if (accommodation == true) {
    // Get Accommodation Activity
    chosenAccommodationCampaign = await getCampaign(
      coordinates,
      "accommodation",
      radius
    );
    if (chosenAccommodationCampaign != null) {
      accommodationCampaign = true;
      accommodationCampaignId = chosenAccommodationCampaign;
    } else {
      chosenAccommodation = await getPlace(
        location,
        radius,
        accommodationTypes
      );
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
        return res.status(400).json({
          reason: "No results found, please consider increasing search radius.",
          activityType: "accommodation",
        });
      }
    }
  }

  // Generate Daily Activities
  for (let i = 1; i < duration + 1; i++) {
    if (accommodation == true) {
      // if AD CAMPAIGN
      if (accommodationCampaign) {
        // Get Campaign
        campaign = await Campaign.findOne({
          _id: accommodationCampaignId,
        });
        // Create Activity
        const accommodationActivity = new Activity({
          itineraryId: savedItinerary,
          day: i,
          type: "accommodation",
          name: campaign.name,
          place_id: campaign.place_id,
          rating: campaign.rating,
          photo: "No photo",
          description: campaign.description,
          website: campaign.website,
          location: campaign.location,
          ad: true,
        });
        // Save Accommodation
        const savedAccommodation = await accommodationActivity
          .save()
          .catch((e) => {
            return res.status(400).send(e);
          });
      } else {
        // No AD CAMPAIGN
        // Check if activity place has a photo
        let photoBoolean = true;
        if (chosenAccommodation.photos == undefined) {
          photoBoolean = false;
        }
        const placeDetails = await getPlaceDetails(
          chosenAccommodation.place_id
        );
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
          description: placeDetails.result.formatted_phone_number,
          website: placeDetails.result.website,
          location: placeDetails.result.formatted_address,
          ad: false,
        });
        // Save Accommodation
        const savedAccommodation = await accommodationActivity
          .save()
          .catch((e) => {
            return res.status(400).send(e);
          });
      }
    }

    if (food == true) {
      // Get Food Activity
      chosenFoodCampaign = await getCampaign(coordinates, "food", radius);
      if (chosenFoodCampaign != null) {
        foodCampaign = true;
        foodCampaignId = chosenFoodCampaign;
      } else {
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
          return res.status(400).json({
            reason:
              "No results found, please consider increasing search radius.",
            activityType: "food",
          });
        }
      }
      // if AD CAMPAIGN
      if (foodCampaign) {
        // Get Campaign
        campaign = await Campaign.findOne({
          _id: foodCampaignId,
        });
        // Create Activity
        const foodActivity = new Activity({
          itineraryId: savedItinerary,
          day: i,
          type: "food",
          name: campaign.name,
          place_id: campaign.place_id,
          rating: campaign.rating,
          photo: "No photo",
          description: campaign.description,
          website: campaign.website,
          location: campaign.location,
          ad: true,
        });
        // Save Food
        const savedFood = await foodActivity.save().catch((e) => {
          return res.status(400).send(e);
        });
      } else {
        // No AD CAMPAIGN
        // Check if activity place has a photo
        let photoBoolean = true;
        if (chosenFood.photos == undefined) {
          photoBoolean = false;
        }
        const placeDetails = await getPlaceDetails(chosenFood.place_id);
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
          description: placeDetails.result.formatted_phone_number,
          website: placeDetails.result.website,
          location: placeDetails.result.formatted_address,
          ad: false,
        });
        // Save Food
        const savedFood = await foodActivity.save().catch((e) => {
          return res.status(400).send(e);
        });
      }
    }

    if (daylife == true) {
      // Get Daylife Activity
      chosenDaylifeCampaign = await getCampaign(coordinates, "daylife", radius);
      if (chosenDaylifeCampaign != null) {
        daylifeCampaign = true;
        daylifeCampaignId = chosenDaylifeCampaign;
      } else {
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
            reason:
              "No results found, please consider increasing search radius.",
            activityType: "daylife",
          });
        }
      }
      // if AD CAMPAIGN
      if (daylifeCampaign) {
        // Get Campaign
        campaign = await Campaign.findOne({
          _id: daylifeCampaignId,
        });
        // Create Activity
        const daylifeActivity = new Activity({
          itineraryId: savedItinerary,
          day: i,
          type: "daylife",
          name: campaign.name,
          place_id: campaign.place_id,
          rating: campaign.rating,
          photo: "No photo",
          description: campaign.description,
          website: campaign.website,
          location: campaign.location,
          ad: true,
        });
        // Save Daylife
        const savedDaylife = await daylifeActivity.save().catch((e) => {
          return res.status(400).send(e);
        });
      } else {
        // No AD CAMPAIGN
        // Check if activity place has a photo
        let photoBoolean = true;
        if (chosenDaylife.photos == undefined) {
          photoBoolean = false;
        }
        const placeDetails = await getPlaceDetails(chosenDaylife.place_id);
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
          description: placeDetails.result.formatted_phone_number,
          website: placeDetails.result.website,
          location: placeDetails.result.formatted_address,
          ad: false,
        });
        // Save Daylife
        const savedDaylife = await daylifeActivity.save().catch((e) => {
          return res.status(400).send(e);
        });
      }
    }

    if (nightlife == true) {
      // Get Nightlife Activity
      chosenNightlifeCampaign = await getCampaign(
        coordinates,
        "nightlife",
        radius
      );
      if (chosenNightlifeCampaign != null) {
        nightlifeCampaign = true;
        nightlifeCampaignId = chosenNightlifeCampaign;
      } else {
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
          return res.status(400).json({
            reason:
              "No results found, please consider increasing search radius.",
            activityType: "nightlife",
          });
        }
      }
      // if AD CAMPAIGN
      if (nightlifeCampaign) {
        // Get Campaign
        campaign = await Campaign.findOne({
          _id: nightlifeCampaignId,
        });
        // Create Activity
        const nightlifeActivity = new Activity({
          itineraryId: savedItinerary,
          day: i,
          type: "nightlife",
          name: campaign.name,
          place_id: campaign.place_id,
          rating: campaign.rating,
          photo: "No photo",
          description: campaign.description,
          website: campaign.website,
          location: campaign.location,
          ad: true,
        });
        // Save Nightlife
        const savedNightlife = await nightlifeActivity.save().catch((e) => {
          return res.status(400).send(e);
        });
      } else {
        // No AD CAMPAIGN
        // Check if activity place has a photo
        let photoBoolean = true;
        if (chosenNightlife.photos == undefined) {
          photoBoolean = false;
        }
        const placeDetails = await getPlaceDetails(chosenNightlife.place_id);
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
          description: placeDetails.result.formatted_phone_number,
          website: placeDetails.result.website,
          location: placeDetails.result.formatted_address,
          ad: false,
        });
        // Save Nightlife
        const savedNightlife = await nightlifeActivity.save().catch((e) => {
          return res.status(400).send(e);
        });
      }
    }

    // SUCCESSFULLY Created an itinerary!
    return res.status(201).send(itinerary._id);
  }
});

async function getPlaceDetails(placeId) {
  const placeDetails = await fetch(
    "https://maps.googleapis.com/maps/api/place/details/json?place_id=" +
      placeId +
      "&key=" +
      process.env.PLACES_API_KEY
  )
    .then((res) => res.json())
    .then((json) => json);
  console.log(placeDetails);
  return placeDetails;
}

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

async function getCampaign(itineraryCoords, type, radius) {
  // Latitute and Longitude for itinerary
  let itineraryLat = itineraryCoords.split(",")[0];
  let itineraryLon = itineraryCoords.split(",")[1];
  // Get All Active Campagins
  activeCampaigns = await Campaign.find({ active: true, type: type });
  // Define variables
  let distance = null;
  let campaignsInRange = [];
  let now = new Date();
  // Check if itinerary coordinates are within range of campaign coordinates
  for (let i = 0; i < activeCampaigns.length; i++) {
    // Latitude and Longitude for campaign coordinates
    let campaignLat = activeCampaigns[i].coordinates.split(",")[0];
    let campaignLon = activeCampaigns[i].coordinates.split(",")[1];
    // Check Distance
    distance = geolib.getDistance(
      { latitude: itineraryLat, longitude: itineraryLon }, // Itinerary coords
      { latitude: campaignLat, longitude: campaignLon } // Campaign coords
    );
    if (distance <= radius) {
      if (activeCampaigns[i].start_date < now) {
        // check if the campaign has started
        campaignsInRange.push(activeCampaigns[i]._id);
        console.log("within search radius and time");
        console.log(
          `Campaign ${activeCampaigns[i]._id} has started. Start:${activeCampaigns[i].start_date} Now:${now}`
        );
      } else {
        console.log("within search radius but not time");
        console.log(
          `Campaign ${activeCampaigns[i]._id} has not started. Start:${activeCampaigns[i].start_date} Now:${now}`
        );
      }
    } else {
      console.log("not within search radius");
    }
  }
  const chosenCampaign =
    campaignsInRange[Math.floor(Math.random() * campaignsInRange.length)];

  if (chosenCampaign == undefined) {
    return null;
  } else {
    // Get Campaign
    campaign = await Campaign.findOne({
      _id: chosenCampaign,
    });
    // CAMPAIGN TRACKING LOGIC
    // check if its the next day
    let views_today_date = campaign.views_today_date;
    let nextDay = views_today_date.setDate(views_today_date.getDate() + 1);
    if (now > nextDay) {
      campaign.views_today = 0; // reset views for the day
      campaign.views_today_date = nextDay;
      console.log(`Next day, views_today reset for ${campaign._id}.`);
    }
    //check if daily max views is met
    if (campaign.daily_views_max <= campaign.views_today) {
      console.log(`Daily max views met for ${campaign._id}.`);
      return null;
    }

    let currentViews = campaign.views;
    campaign.views = currentViews + 1;
    let views_today = campaign.views_today;
    campaign.views_today = views_today + 1;

    // Check if campaign has ended
    if (campaign.views >= campaign.total_views) {
      campaign.active = false;
      campaign.complete = true;
      console.log(`Campaign ${campaign._id} is complete.`);
    }

    // Save campaign view count
    await campaign.save().catch((e) => {
      console.log(e);
    });
    return chosenCampaign;
  }
}

module.exports = router;
