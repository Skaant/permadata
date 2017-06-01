import React from 'react'
import firebase from 'firebase'

export default ({ dataId, itemType, propType, refresh, index, votes = [] }) => {

    const user = firebase.auth().currentUser
    const userId = ( user && user.uid ) || null

    const userHasVoted = votes.includes(userId)

    const updateVote = () => {

        const votesRef = firebase.database().ref(

            'datas/' + dataId + '/' + itemType + 's' + 
            ( itemType === 'prop' ? '/' + propType : '' ) + 
            '/' + index + '/votes'
        )

        votesRef.once('value').then(snapshot => {

            let votes = snapshot.val() || []

            if ( !userHasVoted )

                votes.push(userId)

            else votes.splice(votes.indexOf(userId), 1)
        
            votesRef.set(votes).then(() => refresh())
        })
    }

    return (

        <div onClick={ () => updateVote() }>
            <span type="button"
                    className={ userHasVoted ? 'voted' : '' }>
                { votes.length }</span>
        </div>
    )
}