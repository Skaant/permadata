import React from 'react'
import firebase from 'firebase'

export default ({ dataId, itemType, propType, refresh, index, value, votes, author, url }) => {

    const deleteItem = () => {

        const itemListRef = firebase.database().ref('datas/' + dataId + '/' + itemType + 's' + (

            itemType === 'prop' ? '/' + propType : ''
        ))

        itemListRef.once('value').then(snapshot => {
            
            const itemList = snapshot.val()

            itemList.splice(index, 1)

            itemListRef.set(itemList).then(() => refresh())
        })
    }

    return (
        <div>
            { value } {
                itemType === 'link' && (

                    <span className="clickable" 
                            onClick={ () => window.location.assign('/' + url) }>
                        <b>({ url })</b></span>
                )
            } {

                author === firebase.auth().currentUser.uid && (
                    <span className="clickable"
                            onClick={ () => deleteItem() }>
                        [x]</span>
                )
            }
        </div>
    )
}