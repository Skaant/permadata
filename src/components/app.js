import React, { Component } from 'react'
import firebase from 'firebase'

import Navbar from './navbar'
import Content from './content'

import firebaseConfig from '../firebase.config'

import urlParameters from '../helpers/url-parameters'

import '../styles/app.css'

export default class extends Component {

    constructor() {

        super()

        firebase.initializeApp(firebaseConfig)

        this.state = {

            user: null,
            data: null,
            dataId: urlParameters('key') || 'permadata'
        }
    }

    componentWillMount() {

        firebase.auth().onAuthStateChanged(user => this.setState({ user }))

        firebase.auth().getRedirectResult().then(result => this.setState({ user: result.user }))

        this.refresh()
    }

    refresh() {

        const dataId = this.state.dataId

        const dataRef = firebase.database().ref('datas/' + dataId )
        
        dataRef.once('value').then(snapshot => {

            const data = snapshot.val()

            if (data) 
                this.setState({ data })

            else this.setState({ creation: true })
        })
    }

    render() {

        const { user, dataId, data, creation, searchFound } = this.state

        const navbarParams = { searchFound, user }

        const contentParams = { 

             dataId,
             data,
             creation,
             refresh: this.refresh.bind(this),
             user
        }

        return (

            <div>
                <Navbar { ...navbarParams } />

                <Content { ...contentParams } />
            </div>
        )
    }
}
