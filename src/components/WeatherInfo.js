import React, {useState } from "react"
import '../index.css';

export default function WeatherInfo () {
    const [collapsed, setCollapsed] = useState(true)
    const [location, setLocation] = useState("")
    const [alert, setAlert] = useState([])
    const [loading, setLoading] = useState(false)

    const toggleCollapse = () => {
      setCollapsed(!collapsed)
      setLocation('')
      setAlert([])
    }

    const handleChange = (e) => {
        setLocation(e.target.value)
    }

    const getWeather = (event) => {
        event.preventDefault()
        setLoading(true)
        setAlert([])
        fetch('/api/weather-alerts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "location": location })
        })
        .then(res => res.json())
        .then(({ result }) => {
            setLoading(false)
            if (result) {
               setLocation('')
               setAlert(result.length === 0 ? ['No alert at the moment'] : result)
            } else {
               setLocation('Location error. Try again.')
            }
        })
    }

    return (
        <>
            <div className="p-10">
                <button className="w-full items-center p-4 text-center text-white bg-green-400 rounded-lg" onClick={toggleCollapse}>Severe Weather Info {collapsed ? "▼" : "▲"}</button>             
                {!collapsed && (
                    <div className="list-disc pl-6">
                        <br />
                        <form onSubmit={getWeather}>
                            <input type="text" required placeholder="Enter location" className="p-2 text-black font-medium" value={location} onChange={handleChange}/>
                        </form>
                        {loading ? (
                        <p className="text-white">Loading...</p>
                        ) : (
                        null
                        )}
                        {alert.length === 1 ? (
                            <p className="text-red-700">{alert[0]}</p>
                        ) : (
                            alert.map((singleAlert, index) => (
                                <li key={index} className="text-red-700">
                                    {singleAlert}
                                </li>
                            ))
                        )}
                    </div>
                )}
        
            </div>
        </>
    )
}