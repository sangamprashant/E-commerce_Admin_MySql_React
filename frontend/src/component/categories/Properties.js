import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";
import audio from "../audio/alert.mp3"
import { AdminContext } from "../../AdminContext";
import { toast } from "react-toastify";

function Pro({ swal }) {
  const { token,nav,setNav } = useContext(AdminContext);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [catEdit, setCatEdit] = useState(null);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    setNav("category")
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await axios.get("/api/properties",{
        headers: {
          Authorization: "Bearer " + token, // Set the Authorization header
        },
      });
      console.log(result.data)
      setProperties(result.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handelSave = async (e) => {
    e.preventDefault();
    if (name.trim() === "") {
      toast.error("Name is empty. Please enter a name.");
      return;
    }
    if (parentCategory.trim() === "") {
        toast.error("value is empty. Please enter a value.");
        return;
      }
    try {
      const data = {
        name,
        parentCategory,
      };
      if (catEdit) {
        data.id = catEdit._id;
        await axios.put("/api/properties", data,{
          headers: {
            Authorization: "Bearer " + token, // Set the Authorization header
          },
        });
      } else {
        await axios.post("/api/properties", data,{
          headers: {
            Authorization: "Bearer " + token, // Set the Authorization header
          },
        });
      }
      setName("");
      setParentCategory("");
      setProperties([]);
      setCatEdit(null);
      fetchData();
    } catch (error) {
      console.error("Error while sending the POST request:", error);
    }
  };

  function handelEdit(category) {
    setCatEdit(category);
    setName(category.name);
    setParentCategory(category?.parent || "");
  }

  function deleteCategory(category) {
    const alertSound = new Audio(audio);
    alertSound.play();
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete '${category.name}'`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`/api/properties/${category._id}`,
            {
              headers: {
                Authorization: "Bearer " + token, // Set the Authorization header
              },
            }
            );
            fetchData();
          } catch (error) {
            console.error("Error deleting category:", error);
          }
        }
      });
  }

  return (
    <div className=" overflow-scroll" style={{height:"90vh"}}>
      <h1>Properties</h1>
      <label>
        {catEdit ? `Edit Properties '${catEdit.name}'` : "Create New Properties "}
      </label>
      <form onSubmit={handelSave}>
        <div className="flex gap-1">
          <input
            type="text"
            className=""
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            className=""
            placeholder="Category name"
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {catEdit && (
            <button
              type="button"
              className="btn-default py-2"
              onClick={() => {
                setCatEdit(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary py-2">
            Save
          </button>
        </div>
      </form>
      {!catEdit && (
        <table className="table-basic">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {properties.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category?.parent}</td>
                <td>
                  <button
                    onClick={() => handelEdit(category)}
                    className="btn-primary mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="btn-primary"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default withSwal(({ swal }, ref) => <Pro swal={swal} />);
