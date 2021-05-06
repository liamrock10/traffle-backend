const router = require("express").Router();
const verify = require("../middleware/verifyToken");
const fetch = require("node-fetch");
const User = require("../models/User");
const Activity = require("../models/Activity");
const Campaign = require("../models/Campaign");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");
const { itineraryValidation } = require("../validation");
const dateFormat = require("dateformat");

// All Campagins
router.get("/", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Get All Campagins
  allCampaigns = await Campaign.find({ userId: user });
  // Render campaigns page with all campaigns
  res.render("business/all-campaigns", {
    pageTitle: "All Campaigns",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
    campaigns: allCampaigns,
  });
});

// Single Campaign
router.get("/:campaignId", verify(), async (req, res, next) => {
  // Get Campaign
  campaign = await Campaign.findOne({
    _id: req.params.campaignId,
    userId: req.user._id,
  });
  // Render the single campaigns page
  res.render("business/campaign", {
    pageTitle: "Campaign",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
    campaign: campaign,
  });
});

router.get("/create-campaign", verify(), async (req, res, next) => {
  res.render("business/create-campaign", {
    pageTitle: "Create Campaign",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

router.post("/create-campaign", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  //   Validate Data
  const { error } = itineraryValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //   Convert Location to Coordinates
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
  // Calculate max daily views
  let start_date = new Date(dateFormat(req.body.start_date, "isoDateTime"));
  let end_date = new Date(dateFormat(req.body.end_date, "isoDateTime"));
  let timeDifference = end_date.getTime() - start_date.getTime();
  let daysDifference = timeDifference / (1000 * 3600 * 24);
  let daily_views_max = req.body.total_views / daysDifference;
  if (daysDifference <= 1) {
    req.flash("error", "Date range must be longer than 1 day.");
    res.redirect("/business/create-campaign");
  }
  // Check if start date is in the future
  const now = new Date();
  if (start_date < now || end_date < start_date) {
    req.flash("error", "Please enter a valid date range.");
    res.redirect("/business/create-campaign");
  }
  //   // CREATE Campaign
  const campaign = new Campaign({
    userId: user,
    total_views: req.body.total_views,
    views: 0,
    daily_views_max: daily_views_max,
    start_date: start_date,
    end_date: end_date,
    cost: req.body.cost,
    name: req.body.name,
    organisation_name: user.organisation_name,
    location: req.body.location,
    coordinates: coordinates,
    description: req.body.description,
    website: req.body.website,
    place_id: "ad",
    rating: 0,
    type: req.body.type,
    active: true,
  });
  // Save Campaign
  const savedCampaign = await campaign.save().catch((e) => {
    console.log(e);
    req.flash("error", "An error occurred.");
    res.render("business/create-campaign", {
      pageTitle: "Create Campaign",
      path: "/",
      errorMessage: req.flash("error"),
      successMessage: req.flash("success"),
      isAuthenticated: isAuthenticated(req),
      isAdmin: isAdmin(req),
    });
  });

  res.status(200).send(savedCampaign);
});

module.exports = router;
