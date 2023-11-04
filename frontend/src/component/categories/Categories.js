import React from 'react';
import Cat from './Cat';
import Properties from './Properties';

function Categories() {
  return (
    <table className='table w-full'>
      <tr>
        <td className='' style={{ position: 'sticky', top: 0, zIndex: 1 }}><Cat/></td>
        <td className='' style={{ position: 'sticky', top: 0, zIndex: 1 }}><Properties/></td>
      </tr>
    </table>
  );
}

export default Categories;
