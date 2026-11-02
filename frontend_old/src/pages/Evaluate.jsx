import { useState } from "react";
import api from "../services/api";


function Evaluate() {

  const [featureName, setFeatureName] = useState("");
  const [userId, setUserId] = useState("");

  const [result, setResult] = useState(null);


  const evaluateFeature = async () => {

    try {

      const response = await api.get("/evaluate/", {
        params: {
          feature_name: featureName,
          user_id: Number(userId)
        }
      });


      setResult(response.data);


    } catch(error) {

      console.error(error);
      alert(
        JSON.stringify(error.response?.data)
      );

    }

  };


  return (

    <div style={{padding:30}}>

      <h1>Feature Evaluation</h1>

      <hr />


      <h3>Check Feature Access</h3>


      <input
        placeholder="Feature Name"
        value={featureName}
        onChange={(e)=>
          setFeatureName(e.target.value)
        }
      />


      <br/><br/>


      <input
        placeholder="User ID"
        value={userId}
        onChange={(e)=>
          setUserId(e.target.value)
        }
      />


      <br/><br/>


      <button onClick={evaluateFeature}>
        Evaluate
      </button>


      <hr/>


      {
        result && (

          <div>

            <h2>Result</h2>

            <p>
              Feature:
              <b> {result.feature}</b>
            </p>


            <p>
              Status:
              {
                result.enabled
                ?
                " Enabled ✅"
                :
                " Disabled ❌"
              }
            </p>


            <p>
              Reason:
              <b> {result.reason}</b>
            </p>


          </div>

        )
      }


    </div>

  );

}


export default Evaluate;