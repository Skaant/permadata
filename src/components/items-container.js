import React from 'react'

import Item from './item'

export default ({ itemType, items, propType }) => {

    const itemList = (items || []).map((item, index) => {
        
        const params = { 
            key: index,
            itemType,
            propType
        }

        return <Item { ...params } { ...item } />
    })

    return (

        <div className={ itemType + 's-container' }>
            { itemList }
        </div>
    )
}