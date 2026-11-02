import "./../styles/pageHeader.css";

function PageHeader({

  title,

  description,

  buttonText,

  onButtonClick,

  icon

}){

  return(

    <div className="page-header">

      <div>

        <div className="page-title">

          <span className="page-icon">

            {icon}

          </span>

          <h2>

            {title}

          </h2>

        </div>

        <p>

          {description}

        </p>

      </div>



      {

        buttonText && (

          <button

            className="header-btn"

            onClick={onButtonClick}

          >

            + {buttonText}

          </button>

        )

      }

    </div>

  );

}

export default PageHeader;