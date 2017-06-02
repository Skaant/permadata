import React, { Component } from 'react'
import firebase from 'firebase'

export default class extends Component {

    constructor() {

        super()

        this.state = { form: {} }
    }

    updateForm(dataId, e) {

        const value = e.target.value

        this.setState({ form: Object.assign({}, this.state.form, { [dataId]: value })})
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

                    this.closeForm()    
                    refresh()
                })
            })
        }
    }

    render() {

        const { itemType, closeForm } = this.props
        const form = this.state && this.state.form

        return (

            <div className="modal">

                <div className="modal-background"
                        onClick={ () => closeForm() }></div>

                <div className="modal-content">

                    <div className="box is-info">

                        <h4 className="title">ajouter</h4>

                        <div className="field">
                            <p className="control">

                                <input type="text" className="input" placeholder="le titre de l'idée" autoFocus
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
                                        onClick={ () => closeForm() }>annuler</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}