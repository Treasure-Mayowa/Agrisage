import React, { useState } from "react";
import '../index.css';

export default function Form () {

    const [message, setMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [generating, setGenerating] = useState(false)

    const handleGenerate = () => {
        setGenerating(true)
        fetch('/api/generate', {
            method: 'POST'
          })
            .then(res => res.json())
            .then(data => {
              if (data.message) {
                let result = data.message.trim()
                setMessage(result)
                setGenerating(false)
              } else {
                setErrorMessage('Error in generation')
                setGenerating(false)
            }
        })
    }


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
                    <textarea cols={35} rows={5} required value={message} className="p-2 text-black" autoFocus={true} onChange={handleChange} placeholder="Enter message"></textarea>
                    <br/>
                    <button type="submit" className="shadow-sm bg-green-400 p-2 rounded-lg w-full" disabled={submitting}>Send</button>
                </form>
                <br />
                <button className="hover:bg-yellow-400 hover:text-black text-white border-y-yellow-400 border-x-yellow-400 p-2 w-full rounded-md" disabled={generating} onClick={handleGenerate}>Generate Message</button>
                <em className="text-rose-700">{errorMessage}</em>
            </div>
        </>
    )
}