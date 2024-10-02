const compareDates = (date1, date2) => {
    console.log(date2);
    

    // Convert both dates to Date objects
    const parsedDate1 = new Date(date1);
    const parsedDate2 = new Date(date2);
  
    // Extract only the date part (year, month, day) for comparison
    const formattedDate1 = parsedDate1.toISOString().split('T')[0];
    const formattedDate2 = parsedDate2.toISOString().split('T')[0];
  
    // Compare the formatted dates
    return formattedDate1 === formattedDate2;
  }

  const hasDateExceededToday = (givenDate) => {
    // Convert the given date to a Date object
    const dateToCheck = new Date(givenDate);
  
    // Get today's date
    const today = new Date();
  
    // Set the time to 00:00:00 for both dates to compare only the date part
    today.setHours(0, 0, 0, 0);
    dateToCheck.setHours(0, 0, 0, 0);
  
    // Check if the given date is greater than today's date
    return dateToCheck > today;
  }
  module.exports = {compareDates,hasDateExceededToday};