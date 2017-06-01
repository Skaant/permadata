import React, { Component } from 'react'
import firebase from 'firebase'

import Item from './item'

export default class extends Component {

    updateForm(key, e) {

        const value = e.target.value

        this.setState({ form: Object.assign({}, this.state.form, { [key]: value })})
    }

    sendForm() {
        
        const currentUser = firebase.auth().currentUser

        if (currentUser) {

            const { dataId, itemType, propType, refresh } = this.props
            const { form } = this.state

            const itemListRef = firebase.database().ref('datas/' + dataId + '/' + itemType + 's' + (

                itemType === 'prop' ? '/' + propType : ''
            ))

            itemListRef.once('value').then(snapshot => {
                
                const itemList = snapshot.val()
                const item = Object.assign({}, form, { author: currentUser.uid })

                itemListRef.set( ( itemList || [] ).concat([ item ]) ).then(() => {

                    this.setState({ form: null })    
                    refresh()
                })
            })
        }
    }

    render() {

        const { dataId, itemType, propType, loaded, refresh, title, items } = this.props

        const form = this.state ? this.state.form : null

        const itemList = (items || []).map((item, index) => {
            
            const params = { 

                key: index,
                dataId,
                itemType,
                propType,
                refresh,
                index
            }

            return <Item { ...params } { ...item } />
        })
        
        return (

            <div className={ itemType + 's-container' }>

                <h3 className="title is-4">{ title }</h3>
                
                <div className="inline-container">

                    { itemList }

                    {
                        loaded && form ? (

                            <div className="modal">

                                <div className="modal-background"
                                        onClick={ () => this.setState({ form: null }) }></div>

                                <div className="modal-content">

                                    <div className="box is-info">

                                        <h4 className="title">ajouter</h4>

                                        <div className="field">
                                            <p className="control">

                                                <input type="text" className="input" placeholder="le titre de l'idée"
                                                        onChange={ e => this.updateForm('value', e) }/>
                                            </p>
                                        </div>
                                                
                                        {
                                            itemType === 'link' && (
                                                        
                                                <div className="field">
                                                    <p className="control">

                                                        <input type="text" className="input" placeholder="clé de la page cible"
                                                                onChange={ e => this.updateForm('url', e) }/>
                                                    </p>
                                                </div>
                                            )
                                        }

                                        <div className="field is-grouped">
                                            <p className="control">

                                                <button type="button" className="button"
                                                        disabled={ ( itemType !== 'link' ? !form.value : !form.value || !form.url ) && 'disabled' }
                                                        onClick={ () => this.sendForm() }>
                                                    envoyer</button>
                                            </p>
                                                    
                                            <p className="control">

                                                <button type="button" className="button"
                                                        onClick={ () => this.setState({ form: null }) }>annuler</button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (

                            <span className="item tag is-info is-medium clickable"
                                    onClick={ () => this.setState({ form: {} }) }>
                                ajouter</span>
                        )
                    }
                </div>
            </div>
        )
    }
}