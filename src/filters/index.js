// import parseTime, formatTime and set to filter
export { parseTime, formatTime } from '@/utils'




//Default        MState = 0
	// RequestTest    MState = 1
	// Testing        MState = 2
	// RequestReview  MState = 3
	// Reviewing      MState = 4
	// ReviewApproval MState = 5
	// Merged         MState = 6
export function statusFilter (mr) {
  var statusMap = {
    0: '',
    1: '',
    2:  mr.tester,
    3: '',
    4: mr.reviewer,
    5: mr.merge_reviewer,
    6: ''
  }

  const state = mr.local_state


  const value = statusMap[state]
  statusMap[state] = styleStatus(value)
  return statusMap
}

function styleStatus (s) {
  return {
    style: {
      color: '#1989FA'
    },
    label:  s 
  }
}
