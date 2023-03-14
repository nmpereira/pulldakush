const Products = require("../../models/Products");

const mongoRunner = async ({
  variation_document,
  location_id,
  company_name,
}) => {
  const now = Date.now();

  try {
    const variation = await Products.findOne({
      variationid: variation_document.variationid,
      location_id,
      company_name,
    });

    if (!variation) {
      const result = await Products.create({
        company_name,
        location_id: location_id,
        ...variation_document,

        updatedAt: now,

        priceHistory: {
          [now]: `${variation_document.price}`,
        },
        promoPriceHistory: {
          [now]: `${variation_document.promoPrice}`,
        },
        priceHistoryUpdatedAt: now,
        promoPriceHistoryUpdatedAt: now,
      });

      return {
        result,

        action: [`Created new variation ${variation_document.variationid}`],
      };
    } else {
      variation.location_id = location_id;
      variation.company_name = company_name;
      variation.updatedAt = now;

      const action = [];
      if (
        variation.price !== variation_document.price ||
        variation.promoPrice !== variation_document.promoPrice
      ) {
        if (variation.price !== variation_document.price) {
          variation.price = variation_document.price;
          variation.priceHistory = new Map([
            ...variation.priceHistory,
            [`${now}`, `${variation_document.price}`],
          ]);
          variation.priceHistoryUpdatedAt = now;

          action.push(
            `Updated variation ${variation_document.variationid} with new price: ${variation_document.price}`
          );
        }
        if (variation.promoPrice !== variation_document.promoPrice) {
          variation.promoPrice = variation_document.promoPrice;
          variation.promoPriceHistory = new Map([
            ...variation.promoPriceHistory,
            [`${now}`, `${variation_document.promoPrice}`],
          ]);
          variation.promoPriceHistoryUpdatedAt = now;
          action.push(
            `Updated variation ${variation_document.variationid} with new promo price: ${variation_document.promoPrice}`
          );
        }

        return {
          result: await variation.save(),
          action,
        };
      } else {
        // update the updatedAt field
        variation.updatedAt = now;

        return {
          result: await variation.save(),
          action: [`No changes to variation ${variation_document.variationid}`],
        };
      }
    }
  } catch (error) {
    console.log({ variation_document, location_id, company_name, error });
  }
};

module.exports = { mongoRunner };
