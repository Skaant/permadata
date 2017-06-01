import React, { Component } from 'react'
import firebase from 'firebase'

import Item from './item'

export default class extends Component {

    updateForm(key, e) {

        const value = e.target.value

        this.setState({ form: Object.assign({}, this.state.form, { [key]: value })})
    }

    sendForm() {

        const { itemType, propType, refresh } = this.props
        const { form } = this.state

        const itemListRef = firebase.database().ref('datas/' + this.props.dataId + '/' + itemType + 's' + (

            itemType === 'prop' ? '/' + propType : ''
        ))

        itemListRef.once('value').then(snapshot => {
            
            const itemList = snapshot.val()

            itemListRef.set( ( itemList || [] ).concat([ form ]) ).then(() => {

                this.setState({ form: null })    
                refresh()
            })
        })
    }

    render() {

        const { itemType, title, items, propType } = this.props
        const { form } = this.state || { form: null }

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

                <h3>{ title }</h3>
                
                { itemList }

                {
                    this.state && form ? (

                        <div>
                            <input type="text" placeholder="le titre de l'idée"
                                    onChange={ e => this.updateForm('value', e) }/>
                                    
                            {
                                itemType === 'link' && (

                                    <input type="text" placeholder="clé de la page cible"
                                            onChange={ e => this.updateForm('url', e) }/>
                                )
                            }

                            <button type="button"
                                    disabled={ ( itemType !== 'link' ? !form.value : !form.value || !form.url ) && 'disabled' }
                                    onClick={ () => this.sendForm() }>
                                envoyer</button>
                            <button type="button">annuler</button>
                        </div>
                    ) : (

                        <button type="button"
                                onClick={ () => this.setState({ form: {} }) }>
                            [+]</button>
                    )
                }
            </div>
        )
    }
}