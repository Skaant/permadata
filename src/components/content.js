import React, { Component } from 'react'
import firebase from 'firebase'

import ItemsContainer from './items-container'

const PROPS_TYPES = {

    context: 'contexte',
    inputs: 'intrants',
    outputs: 'extrants',
    functions: 'fonctions'
}

export default class extends Component {
    
    openForm() {

        this.setState({ form: { title: null } })
    }

    sendForm() {
        
        const { dataId, user } = this.props

        if (user) {

            const { form: { title }} = this.state

            firebase.database().ref('/datas/'+ dataId ).set({

                author: user.uid,
                title
            }).then(() => window.location.reload())
        }
    }

    deleteData() {

        const { data: { title }, dataId } = this.props

        if (window.confirm('voulez-vous vraiment supprimer votre page "' + title + '" [' + dataId + '] ?')) {

            const dataRef = firebase.database().ref('datas/' + dataId)
            
            dataRef.remove().then(() => window.location.assign('/'))
        }
    }

    render() {

        const { dataId, data, creation, user, refresh } = this.props
        const form = this.state && this.state.form

        const commonContainerParams = {

            dataId,
            loaded: data !== null,
            refresh
        }

        const keywordsContainerParams = Object.assign({}, commonContainerParams, {

            itemType: 'keyword',
            title: 'mots-clés',
            items: data && data.keywords
        })

        const linksContainerParams = Object.assign({}, commonContainerParams, {

            itemType: 'link',
            title: 'relations',
            items: data && data.links,
        })

        const propsTypesContainers = Object.keys(PROPS_TYPES).map(prop => {

            const params = Object.assign({}, commonContainerParams, {

                itemType: 'prop',
                propType: prop,
                title: PROPS_TYPES[prop],
                items: ( data && data.props ) && data.props[prop]
            })

            return (

                <div key={ prop } className="column notification is-primary"
                        style={ { margin: '0 5px' } }>

                    <ItemsContainer { ...params } />
                </div>
            )
        })

        return (

            <div>                
                <div className="container">

                    <div className="notification is-primary">

                        {
                            !data && !creation && (
                                
                                <h1 className="title is-1">chargement ...</h1>
                            )
                        }

                        { 
                            data && (

                                <h1 className="title is-1">{ data.title } {

                                    ( user && data.author === user.uid ) && (

                                        <button type="button" className="delete is-medium clickable"
                                                onClick={ () => this.deleteData() }></button>
                                    )
                                }</h1>
                            )
                        }

                        { data && <ItemsContainer { ...keywordsContainerParams } /> }

                        {
                            creation && (

                                <div className="field is-grouped">

                                    <p className="control">
                                        <input type="text" className="input"
                                                placeholder={ 'titre pour la page "' + dataId + '"' }
                                                onChange={ (e) => this.setState({ form: { title: e.target.value }}) } />
                                    </p>

                                    <p className="control">      
                                        <button type="button" className="button"
                                                disabled={ ( !form || !form.title ) && 'disabled' }
                                                onClick={ () => this.sendForm() }>
                                            envoyer</button>
                                    </p>

                                    <p className="control">
                                        <button type="button" className="button"
                                                onClick={ () => this.setState({ form: null }) }>
                                            annuler</button>
                                    </p>
                                </div>
                            )
                        }
                    </div>

                    { 
                        data && (
                        
                            <div className="notification is-primary">
                                
                                <ItemsContainer { ...linksContainerParams } />
                            </div>
                        )
                    }
                </div>
                { 
                    data && (

                        <div className="props columns">

                            { propsTypesContainers }
                        </div>
                    )
                }
            </div>
        )
    }
}