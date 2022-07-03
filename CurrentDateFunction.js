const currentDateFunction = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const prevMonth = String(today.getMonth()).padStart(2, '0')
    const year = String(today.getFullYear())
    const currentDate = parseInt(year + month + day)
    return currentDate
}

module.exports = currentDateFunction
