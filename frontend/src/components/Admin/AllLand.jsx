import { Button } from '@material-ui/core';
import React, { useEffect } from 'react'
import { AiOutlineDelete, AiOutlineEye } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import Loader from '../Layout/Loader';
import { DataGrid } from '@material-ui/data-grid';
import { getAllLandsShop } from '../../redux/actions/lands';
import { deleteLands } from '../../redux/actions/lands';
const AllLand = () => {
  const { lands, isLoading } = useSelector((state) => state.lands);
  const {seller} = useSelector((state) => state.seller);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllLandsShop(seller._id));
  },[dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteLands(id));
    window.location.reload();
  }
  const columns = [
    { field: "id" , headerName: "Land Id", minWidth: 150, flex:0.7 },
    {
      field:"name",
      headerName:"Name",
      minWidth:100,
      flex:0.6,
    },
    {
      field:"price",
      headerName:"Price",
      minWidth:100,
      flex:0.6,
    },
    {
      field:"landlocation",
      headerName:"Location",
      minWidth:150,
      flex:1.4,
    },
    {
      field:"area",
      headerName:"Area",
      type:"number",
      minWidth:80,
      flex:0.6,
    },
    {
      field:"Preview",
      flex:0.6,
      minWidth:100,
      headerName:"",
      type:"number",
      sortable:false,
      renderCell:(params) => {
       return(
        <>
          <Link to={`/lands/${params.id}`}>
              <Button>
                <AiOutlineEye size={20} />
              </Button>
            </Link>
        </>
       ) 
      }
    },
    {
      field:"Delete",
      flex:0.6,
      minWidth:100,
      headerName:"",
      type:"number",
      sortable:false,
      renderCell:(params) => {
        return(
          <>
            <Button onClick={() => handleDelete(params.id)}>
              <AiOutlineDelete size={20} />
            </Button>
          </>
        );
      },
    },
  ];

  const row = [];

  lands && lands.forEach((item) => {
    row.push({
      id: item._id,
      name: item.name,
      landlocation: item.landlocation,
      price: "₹ " + item.price,
      area:item.area + " Acres",
    })
  })
  return (
     <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </>
  );
}

export default AllLand