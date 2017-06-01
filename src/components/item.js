import React from 'react'
import firebase from 'firebase'

import ItemVote from './item-vote'

export default ({ dataId, itemType, propType, refresh, index, value, author, votes, url }) => {

    const user = firebase.auth().currentUser

    const deleteItem = () => {

        const itemListRef = firebase.database().ref(

            'datas/' + dataId + '/' + itemType + 's' + 
            ( itemType === 'prop' ? '/' + propType : '' )
        )

        itemListRef.once('value').then(snapshot => {
            
            let itemList = snapshot.val()

            itemList.splice(index, 1)

            itemListRef.set(itemList).then(() => refresh())
        })
    }

    const itemVoteParams = { dataId, itemType, propType, refresh, index, votes }

    return (

        <span className="item tag is-white is-medium">

            <span>{ value }</span>
            
            {
                itemType === 'link' && (

                    <span className="clickable" 
                            onClick={ () => window.location.assign('/' + url) }>
                        <b>({ url })</b></span>
                )
            }

            <ItemVote { ...itemVoteParams } />
            
            {

                ( user && author === user.uid ) && (
                    <button type="button" className="delete is-medium clickable"
                            onClick={ () => deleteItem() }></button>
                )
            }
        </span>
    )
}