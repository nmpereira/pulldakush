const { mongoRunner } = require("../helpers/mongoRunner");
const { log } = require("../helpers/logging");

const duchieRunner = async () => {
  log("duchieRunner", "duchie script starting...");
  // send a graphql query using axios
  const axios = require("axios");

  const num_pages = 0;
  const perPage = 1000000000;
  const dispensaries_list = [
    { "ashario-centrepoint-mall": "62e2f7e9b5fb8064976fb4c6" },
    { "ashario-north-york": "62e2f859eb1eb12e116e97c3" },
    { "ashario-aurora": "62e2f833c37b526cbc4eaf6d" },
    { "euphoria-bud": "61425f9168131a00c62f9e11" },
  ];

  for await (const dispensary of dispensaries_list) {
    // get key from dispensaries_list object
    const company_name = Object.keys(dispensary)[0];
    // get value from dispensaries_list object
    const dispensaryId = Object.values(dispensary)[0];

    const store_url_prefix = `https://www.dutchie.com`;

    let linkToStore = "";
    if (company_name === "euphoria") {
      const store_url_prefix = `https://www.dutchie.com`;
      linkToStore = `${store_url_prefix}/dispensary/euphoria-bud`;
    } else {
      linkToStore = `https://www.ashario.com/pages/${company_name}`;
    }

    let locationName = company_name;
    let locationAddress = "";
    if (company_name === "ashario-centrepoint-mall") {
      locationAddress =
        "6464 Yonge St. Unit #187 Centerpoint Mall, North York, ON M2M 3X4 Canada";
    } else if (company_name === "ashario-north-york") {
      locationAddress =
        "1111A Finch Ave. West Unit #1, North York, ON M3J 2P7 Canada";
    } else if (company_name === "ashario-aurora") {
      locationAddress = "15114 Yonge St. Aurora, ON L4G 1M2, Canada";
    } else if (company_name === "euphoria-bud") {
      locationAddress = "1027 Finch Ave W Toronto, ON";
    }

    log("duchieRunner", "company_name", company_name);
    log("duchieRunner", "dispensaryId", dispensaryId);

    const query = `https://dutchie.com/graphql?operationName=FilteredProducts&variables={"includeEnterpriseSpecials":false,"includeCannabinoids":true,"productsFilter":{"dispensaryId":"${dispensaryId}","pricingType":"rec","strainTypes":[],"subcategories":[],"Status":"Active","types":[],"useCache":false,"sortDirection":1,"sortBy":"weight","isDefaultSort":true,"bypassOnlineThresholds":false,"isKioskMenu":false,"removeProductsBelowOptionThresholds":true},"page":${num_pages},"perPage":${perPage}}&extensions={"persistedQuery":{"version":1,"sha256Hash":"8c6184010874741ccacd9e88b88f433fa5ba6e2699d52d406973d28e094bf1ec"}}`;

    let counter = 0;
    let write_counter = 0;
    const updated_messages = [];
    const start_time = Date.now();
    const response = await axios.get(query).catch((err) => {
      log("duchieRunner", "Error", err);
    });

    log(
      "duchieRunner",
      "duchieRunner",
      "Found",
      response.data.data.filteredProducts.products.length,
      "products from: ",
      company_name,
      "at",
      dispensaryId
    );
    // promise.all
    const variation_documents = [];
    const variation_documents_chunk = [];
    const variation_chunk_size = 25;

    await Promise.all(
      response.data.data.filteredProducts.products.map(
        async (option, index) => {
          // async loop with access to index
          let index_counter = 0;

          // promise.all
          await Promise.all(
            option.Options.map(async (o, i) => {
              const now = new Date();

              const variation_document = {
                company_name: company_name,
                brandname: option.brandName || option.cName,
                location_id: dispensaryId,
                displayname: option.POSMetaData.children[index_counter].option,
                product_id: option.id,

                variationid: `${option.brandName}-${option.id}-${option.Options[index_counter]}`,

                variation_name: `${option.brandName} - ${option.Name}- ${option.Options[index_counter]}`,
                total_size: option.POSMetaData.children[index_counter]
                  .standardEquivalent
                  ? option.POSMetaData.children[index_counter]
                      .standardEquivalent.value
                  : 1,
                pack_size: option.Options[index_counter],
                price: option.Prices[index_counter],
                quantityStatus: `${option.POSMetaData.children[index_counter].quantityAvailable} units`,
                promoPrice: option.recPrices[index_counter],
                productName: option.Name,
                updatedAt: now,
                linkToProduct: `${store_url_prefix}/embedded-menu/${company_name}/product/${option.cName}`,
              };

              variation_documents.push(variation_document);

              index_counter++;
              counter++;
            })
          );
        }
      )
    );

    // chunk the variation_documents array into variation_documents_chunk
    for (let i = 0; i < variation_documents.length; i += variation_chunk_size) {
      variation_documents_chunk.push(
        variation_documents.slice(i, i + variation_chunk_size)
      );
    }

    // variation_documents_chunk
    for await (const variation_document of variation_documents_chunk) {
      const messages_array = [];
      for await (const document of variation_document) {
        write_counter++;

        const write_response = await mongoRunner({
          variation_document: document,
          location_id: dispensaryId,
          company_name,
          locationName,
          locationAddress,
          linkToProduct: document.linkToProduct,
          linkToStore,
        });

        if (!write_response) {
          log("duchieRunner", "error", document.id);
          return;
        }

        write_response.action.forEach((action) => {
          if (action.includes("No changes")) {
            messages_array.push(action);
          } else if (action.includes("Created")) {
            messages_array.push(action);
          } else if (action.includes("Updated")) {
            messages_array.push(action);

            messages_array.push(write_response.result.priceHistory);
            messages_array.push(write_response.result.promoPriceHistory);

            updated_messages.push(
              action,
              write_response.result.priceHistory,
              write_response.result.promoPriceHistory
            );
            log(
              "duchieRunner",
              action,
              write_response.result.priceHistory,
              write_response.result.promoPriceHistory
            );
          }
        });
      }
      log(
        "duchieRunner",
        "locaionid: ",
        dispensaryId,
        "|| counter:",
        write_counter,
        "|| time:",
        new Date(Date.now() - start_time).toISOString().substr(11, 8)
      );
    }
    log(
      "duchieRunner",
      "Updated:",
      updated_messages.length,
      "|| messages:",
      updated_messages
    );
    log(
      "duchieRunner",
      "time:",
      new Date(Date.now() - start_time).toISOString().substr(11, 8)
    );
  }

  log("duchieRunner", "duchie script finished");

  return;
};

module.exports = duchieRunner;
