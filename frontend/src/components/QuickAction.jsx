import "./../styles/quickaction.css";

function QuickAction({

    icon,
    title,
    description,
    color,
    onClick

}){

    return(

        <div
            className="quick-action"
            onClick={onClick}
        >

            <div
                className="quick-icon"
                style={{
                    background:color
                }}
            >

                {icon}

            </div>

            <div>

                <h5>{title}</h5>

                <p>{description}</p>

            </div>

        </div>

    );

}

export default QuickAction;