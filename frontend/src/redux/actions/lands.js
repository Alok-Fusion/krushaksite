import axios from "axios";
import { server } from "../../server";

// create lands
export const createLand =
  (
    name,
    description,
    address,
    landlocation,
    price,
    area,
    statusland,
    images,
    sellerId
  ) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "landsCreateRequest",
      });

      const { data } = await axios.post(
        `${server}/lands/create-lands`,
        {
          name,
          description,
          address,
          landlocation,
          price,
          area,
          statusland,
          images,
          sellerId,
        },
        { withCredentials: true }
      );

      dispatch({
        type: "landsCreateSuccess",
        payload: data.lands,
      });
    } catch (error) {
      dispatch({
        type: "landsCreateFail",
        payload: error.response?.data?.message || error.message,
      });
    }
  };

// get All lands of the seller
export const getAllLandsShop = (id) => async (dispatch) => {
  if (!id) return;
  try {
    dispatch({
      type: "getAllLandsShopRequest",
    });

    const { data } = await axios.get(`${server}/lands/get-all-lands/${id}`);

    dispatch({
      type: "getAllLandsShopSuccess",
      payload: data.lands,
    });
  } catch (error) {
    dispatch({
      type: "getAllLandsShopFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// delete land of a seller
export const deleteLands = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteLandsRequest",
    });

    const { data } = await axios.delete(
      `${server}/lands/delete-seller-land/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteLandsSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteLandsFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// get all lands with optional query filters and pagination
export const getAllLands = (params = {}) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllLandsRequest",
    });

    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);
    if (params.search) query.append("search", params.search);
    if (params.location) query.append("location", params.location);
    if (params.statusland && params.statusland !== "All")
      query.append("statusland", params.statusland);
    if (params.minPrice) query.append("minPrice", params.minPrice);
    if (params.maxPrice) query.append("maxPrice", params.maxPrice);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const { data } = await axios.get(`${server}/lands/get-all-lands${queryString}`);

    dispatch({
      type: "getAllLandsSuccess",
      payload: data.lands,
      pagination: {
        totalLands: data.totalLands,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      },
    });
  } catch (error) {
    dispatch({
      type: "getAllLandsFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};
