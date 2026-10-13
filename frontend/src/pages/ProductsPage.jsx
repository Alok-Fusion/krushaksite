import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import styles from "../styles/styles";
import { getAllProducts } from "../redux/actions/product";
import { categoriesData } from "../static/data";
import { AiOutlineSearch } from "react-icons/ai";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const { allProducts, isLoading, pagination } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "All");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Sync category from URL param if available
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Fetch products with filters and pagination
  useEffect(() => {
    const params = {
      page: currentPage,
      limit,
    };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;
    if (maxPrice) params.maxPrice = maxPrice;

    dispatch(getAllProducts(params));
  }, [dispatch, currentPage, selectedCategory, maxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = {
      page: 1,
      limit,
    };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory;
    if (maxPrice) params.maxPrice = maxPrice;

    dispatch(getAllProducts(params));
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    setCurrentPage(1);
    if (cat === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setMaxPrice("");
    setCurrentPage(1);
    setSearchParams({});
    dispatch(getAllProducts({ page: 1, limit }));
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div>
      <Header activeHeading={3} />
      <br />
      <div className={`${styles.section}`}>
        {/* Search, Filter, and Controls Header */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search crops, seeds, fertilizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <AiOutlineSearch
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* Category Selector */}
            <div className="w-full md:w-56">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="All">All Categories</option>
                {categoriesData &&
                  categoriesData.map((cat, idx) => (
                    <option key={idx} value={cat.title}>
                      {cat.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="w-full md:w-44">
              <input
                type="number"
                placeholder="Max Price (₹)"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium transition"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-4 xl:gap-[30px] mb-8">
              {allProducts &&
                allProducts.map((product, index) => (
                  <ProductCard data={product} key={product._id || index} />
                ))}
            </div>

            {(!allProducts || allProducts.length === 0) && (
              <div className="text-center w-full py-16 bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 text-green-600 font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 my-8">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`px-4 py-2 rounded border text-sm font-medium transition ${
                    currentPage <= 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-9 h-9 rounded text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`px-4 py-2 rounded border text-sm font-medium transition ${
                    currentPage >= totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;
