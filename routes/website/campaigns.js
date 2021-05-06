const router = require("express").Router();
const verify = require("../../middleware/verifyToken");
const fetch = require("node-fetch");
const User = require("../../models/User");
const Activity = require("../../models/Activity");
const Campaign = require("../../models/Campaign");
const isAuthenticated = require("../../middleware/isAuthenticated");
const isAdmin = require("../../middleware/isAdmin");
const { createCampaignValidation } = require("../../validation");
const dateFormat = require("dateformat");

// GET Create Campaign Page
router.get("/create-campaign", verify(), async (req, res, next) => {
  res.render("campaigns/create-campaign", {
    pageTitle: "Create Campaign",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
  });
});

// All Campagins
router.get("/", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  // Get All Campagins
  allCampaigns = await Campaign.find({ userId: user });
  // Render campaigns page with all campaigns
  res.render("campaigns/all-campaigns", {
    pageTitle: "All Campaigns",
    path: "/",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
    activeCampaigns: allCampaigns,
    finishedCampaigns: allCampaigns,
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
  res.render("campaigns/campaign", {
    pageTitle: "Campaign",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
    isAuthenticated: isAuthenticated(req),
    isAdmin: await isAdmin(req),
    campaign: campaign,
  });
});

router.post("/create-campaign", verify(), async (req, res, next) => {
  // Get User
  user = await User.findById({ _id: req.user._id });
  //   Validate Data TODO: replace with campaignValidation
  const { error } = createCampaignValidation(req.body);
  if (error) {
    // Browser
    req.flash("error", error.details[0].message);
    return res.status(400).redirect("/campaigns/create-campaign");
  }
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
  const now = new Date();
  // Set Start Date & Time
  let req_start_date = new Date(dateFormat(req.body.start_date, "isoDateTime"));
  let start_date = new Date(
    req_start_date.getFullYear(),
    req_start_date.getMonth(),
    req_start_date.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getMilliseconds()
  );

  // Set End date & time
  let req_end_date = new Date(dateFormat(req.body.end_date, "isoDateTime"));
  let end_date = new Date(
    req_end_date.getFullYear(),
    req_end_date.getMonth(),
    req_end_date.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getMilliseconds()
  );

  let timeDifference = end_date.getTime() - start_date.getTime();
  let daysDifference = timeDifference / (1000 * 3600 * 24);
  let daily_views_max = req.body.total_views / daysDifference;
  if (daysDifference <= 1) {
    req.flash("error", "Date range must be longer than 1 day.");
    return res.redirect("/campaigns/create-campaign");
  }
  // Check if start and end date range is valid
  if (start_date <= now) {
    req.flash("error", "Starting date must be in the future.");
    return res.redirect("/campaigns/create-campaign");
  }
  if (end_date < start_date) {
    req.flash("error", "End date must be after starting date.");
    return res.redirect("/campaigns/create-campaign");
  }
  //   // CREATE Campaign
  const campaign = new Campaign({
    userId: user,
    total_views: req.body.total_views,
    views: 0,
    daily_views_max: daily_views_max,
    start_date: start_date,
    end_date: end_date,
    cost: req.body.cost, // TODO: calculate cost on backend and then send for confirmation
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
    res.render("campaigns/create-campaign", {
      pageTitle: "Create Campaign",
      path: "/",
      errorMessage: req.flash("error"),
      successMessage: req.flash("success"),
      isAuthenticated: isAuthenticated(req),
      isAdmin: isAdmin(req),
    });
  });
  req.flash("success", `Campaign ${savedCampaign._id} Created!`);
  return res.redirect("/campaigns/create-campaign");
  // res.status(200).send(savedCampaign);
});

module.exports = router;