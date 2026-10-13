import React, { useEffect, useState } from "react";
import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import Loader from "../Layout/Loader";
import styles from "../../styles/styles";
import { toast } from "react-toastify";

const AllLand = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [landId, setLandId] = useState("");

  const fetchLands = () => {
    setIsLoading(true);
    axios
      .get(`${server}/lands/admin-all-lands`, { withCredentials: true })
      .then((res) => {
        setData(res.data.lands || []);
        setIsLoading(false);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to fetch land listings");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchLands();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(
        `${server}/lands/admin-delete-land/${id}`,
        { withCredentials: true }
      );
      toast.success(res.data.message || "Land deleted successfully");
      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete land");
    }
  };

  const columns = [
    { field: "id", headerName: "Land ID", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Name",
      minWidth: 130,
      flex: 0.8,
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "landlocation",
      headerName: "Location",
      minWidth: 140,
      flex: 1.2,
    },
    {
      field: "area",
      headerName: "Area",
      minWidth: 90,
      flex: 0.6,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "Preview",
      flex: 0.6,
      minWidth: 90,
      headerName: "Preview",
      sortable: false,
      renderCell: (params) => {
        return (
          <Link to={`/lands/${params.id}`}>
            <Button>
              <AiOutlineEye size={20} />
            </Button>
          </Link>
        );
      },
    },
    {
      field: "Delete",
      flex: 0.6,
      minWidth: 90,
      headerName: "Delete",
      sortable: false,
      renderCell: (params) => {
        return (
          <Button
            onClick={() => {
              setLandId(params.id);
              setOpen(true);
            }}
          >
            <AiOutlineDelete size={20} className="text-red-500" />
          </Button>
        );
      },
    },
  ];

  const rows = [];

  data &&
    data.forEach((item) => {
      rows.push({
        id: item._id,
        name: item.name || "N/A",
        price: `₹ ${item.price?.toLocaleString("en-IN") || item.price || 0}`,
        landlocation: item.landlocation || item.address || "N/A",
        area: `${item.area || 0} Acres`,
        status: item.statusland || "Available",
      });
    });

  return (
    <div className="w-full flex justify-center pt-5">
      <div className="w-[97%]">
        <h3 className="text-[22px] font-Poppins pb-2 font-[600] text-[#333]">
          All Land Listings
        </h3>
        {isLoading ? (
          <Loader />
        ) : (
          <div className="w-full min-h-[45vh] bg-white rounded shadow-sm">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              autoHeight
            />
          </div>
        )}

        {open && (
          <div className="w-full fixed top-0 left-0 z-[999] bg-[#00000039] flex items-center justify-center h-screen">
            <div className="w-[95%] 800px:w-[40%] min-h-[20vh] bg-white rounded shadow p-5">
              <div className="w-full flex justify-end cursor-pointer">
                <RxCross1 size={25} onClick={() => setOpen(false)} />
              </div>
              <h3 className="text-[22px] text-center py-5 font-Poppins text-[#000000cb]">
                Are you sure you want to delete this land listing?
              </h3>
              <div className="w-full flex items-center justify-center">
                <div
                  className={`${styles.button} text-white text-[16px] !h-[42px] mr-4 cursor-pointer`}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </div>
                <div
                  className={`${styles.button} text-white text-[16px] !h-[42px] ml-4 cursor-pointer !bg-red-600 hover:!bg-red-700`}
                  onClick={() => {
                    setOpen(false);
                    handleDelete(landId);
                  }}
                >
                  Confirm
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllLand;