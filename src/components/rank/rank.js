import React from 'react';

const Rank = ({ name, entries: { entries } }) => {
  // console.log("rank", entries)
  return (
    <div>
      <div className='white f3'>
        {`${name}, entry count is..`}
      </div>
      <div className='white f1'>
        {entries}
      </div>
    </div>
  );

}
export default Rank;