import React, { useState } from "react";
import '../index.css';

export default function Form () {

    const [message, setMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setMessage(e.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setSubmitting(true)
        fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setMessage('')
                setSubmitting(true)
              } else {
                setErrorMessage('Error in message sending')
                setSubmitting(false)
            }
        });
    }

    return (
        <>
            <div>
                <form onSubmit={handleSubmit}>
                    <textarea cols={25} required value={message} className="p-2 text-black" autoFocus={true} onChange={handleChange} placeholder="Enter message"></textarea>
                    <br/>
                    <button type="submit" className="shadow-sm bg-green-400 p-2 rounded-lg w-full" disabled={submitting}>Send</button>
                </form>
                <em className="text-rose-700">{errorMessage}</em>
            </div>
        </>
    )
}