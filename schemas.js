const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.farmplaceSchema = Joi.object({
  farmplace: Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    farmproduct: Joi.string().required(),
    dateAdded: Joi.date().default(() => new Date()),
  }).required(),
});

module.exports.commentSchema = Joi.object({
  comment: Joi.object({
    rating: Joi.number().required(),
    body: Joi.string().required(),
  }).required(),
});
