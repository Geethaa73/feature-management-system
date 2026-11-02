import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const logout = () => {

    localStorage.removeItem("token");

    navigate("/");

  };

  const menu = [

    {
      path:"/dashboard",
      icon:"📊",
      name:"Dashboard"
    },

    {
      path:"/features",
      icon:"🚩",
      name:"Features"
    },

    {
      path:"/environments",
      icon:"🌍",
      name:"Environments"
    },

    {
      path:"/groups",
      icon:"👥",
      name:"Groups"
    },

    {
      path:"/user-groups",
      icon:"👤",
      name:"User Groups"
    },

    {
      path:"/overrides",
      icon:"⚙️",
      name:"Overrides"
    },

    {
      path:"/audit-logs",
      icon:"📜",
      name:"Audit Logs"
    },

    {
      path:"/users",
      icon:"🧑",
      name:"Users"
    }

  ];

  return (

    <div
      style={{
        width:"260px",
        background:"#1e293b",
        color:"white",
        minHeight:"100vh",
        display:"flex",
        flexDirection:"column"
      }}
    >

      <div
        style={{
          padding:"25px",
          borderBottom:"1px solid #334155"
        }}
      >

        <h3>
          🚀 Feature Manager
        </h3>

        <small
          style={{
            color:"#cbd5e1"
          }}
        >
          Admin Panel
        </small>

      </div>

      <div
        style={{
          flex:1,
          padding:"15px"
        }}
      >

        {menu.map((item)=>(

          <NavLink
            key={item.path}
            to={item.path}
            style={({isActive})=>({

              display:"block",

              padding:"12px",

              marginBottom:"10px",

              borderRadius:"10px",

              color:"white",

              textDecoration:"none",

              background:isActive
                ? "#3b82f6"
                : "transparent"

            })}
          >

            {item.icon} {item.name}

          </NavLink>

        ))}

      </div>

      <div
        style={{
          padding:"20px"
        }}
      >

        <button
          className="btn btn-danger w-100"
          onClick={logout}
        >

          Logout

        </button>

      </div>

    </div>

  );

}

export default Sidebar;