/**
 * Property model
 */
export class Property {
  constructor(
    id,
    name,
    location,
    image,
    price,
    originalPrice,
    sleeps,
    bedrooms,
    bathrooms,
    dogsAllowed,
    rating,
    description,
    features,
    nearbyAttractions,
    reviews
  ) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.image = image;
    this.price = price;
    this.originalPrice = originalPrice;
    this.sleeps = sleeps;
    this.bedrooms = bedrooms;
    this.bathrooms = bathrooms;
    this.dogsAllowed = dogsAllowed;
    this.rating = rating;
    this.description = description;
    this.features = features;
    this.nearbyAttractions = nearbyAttractions;
    this.reviews = reviews;
  }
}

/**
 * Simulation Step model
 */
export class SimulationStep {
  constructor(id, question, userAnswer = '', isCompleted = false) {
    this.id = id;
    this.question = question;
    this.userAnswer = userAnswer;
    this.isCompleted = isCompleted;
  }
}

/**
 * Activity model for itinerary
 */
export class Activity {
  constructor(time, description, location = null, type) {
    this.time = time;
    this.description = description;
    this.location = location;
    this.type = type; // 'arrival', 'meal', 'activity', 'rest', 'departure'
  }
}

/**
 * Day Itinerary model
 */
export class DayItinerary {
  constructor(day, title, activities = []) {
    this.day = day;
    this.title = title;
    this.activities = activities;
  }
}

/**
 * Simulation Result model
 */
export class SimulationResult {
  constructor(itinerary = [], personalizedTips = [], highlights = []) {
    this.itinerary = itinerary;
    this.personalizedTips = personalizedTips;
    this.highlights = highlights;
  }
}

/**
 * User Feedback model
 */
export class UserFeedback {
  constructor(
    propertyId,
    rating,
    feedbackType, // 'positive' or 'negative'
    answers = {},
    timestamp = new Date()
  ) {
    this.propertyId = propertyId;
    this.rating = rating;
    this.feedbackType = feedbackType;
    this.answers = answers;
    this.timestamp = timestamp;
  }
}
