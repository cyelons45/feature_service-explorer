let state
let copied_state
let field_changed = false
let eventExist = false

require([
    "esri/request"
], function(esriRequest) {
    var delet = 0
    var dataTable = null
    var formdata = {
        "username": "xxxxxxxx",
        "password": "xxxxxxx",
        "client": "referer",
        "referer": "https://www.arcgis.com",
        "expiration": "60",
        "f": "json"
    }
    state = {}
    $(".number").hide()

    $("#collector").change(function() {
        $("#da_invisble").hide()
        $("#da_invisble").html("Structural Inventory")
    })
    $("#survey123").change(function() {
        $("#da_invisble").html("Damage Assessment")
        $("#da_invisble").show()

    })

    function updateFeature(queryobj) {
        try {
            fetch('https://www.arcgis.com/sharing/rest/generateToken', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(formdata)


                })
                .then(response => response.json())
                .then(response => {
                    var formdata2 = {
                        f: 'json',
                        updates: JSON.stringify([{ "attributes": state }]),
                        token: response.token
                    }
                    let qurl = queryobj.url.split("query")[0] + "applyEdits"

                    fetch(qurl, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: new URLSearchParams(formdata2)
                        })
                        .then(response => response.json()).then(responsedata => {
                            let update_results = responsedata.updateResults
                            if (update_results && update_results.length == 1) {
                                updateresponsepopuphtml()
                                $(".popup_container").show();
                                $("#response-ok").click(function() {

                                    $(".popup_container").hide();
                                })
                                refresh()
                                $(".del_close-btn").click(function() {
                                    $(".popup_container").hide();
                                });
                            }
                        })


                })
        } catch (error) {
            errorpopuphtml(error)
            $(".popup_container").show();
        }
    }


    function deleteFeature(queryobj) {
        try {
            fetch('https://www.arcgis.com/sharing/rest/generateToken', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(formdata)
                })
                .then(response => response.json())
                .then(response => {
                    var formdata2 = {
                        f: 'json',
                        deletes: queryobj.objectId,
                        token: response.token
                    }
                    let qurl = queryobj.url.split("query")[0] + "applyEdits"

                    fetch(qurl, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: new URLSearchParams(formdata2)
                        })
                        .then(response => response.json()).then(responsedata => {
                            let delete_results = responsedata.deleteResults
                            if (delete_results && delete_results.length == 1) {
                                responsepopuphtml()
                                $(".popup_container").show();
                                $("#response-ok").click(function() {

                                    $(".popup_container").hide();
                                })
                                refresh()
                                $(".del_close-btn").click(function() {
                                    $(".popup_container").hide();
                                });
                            }
                        })
                })
        } catch (error) {
            errorpopuphtml(error)
            $(".popup_container").show();
        }
    }




    function formGroupItem(id, value, status) {
        try {
            let formGroupupdate = `
            <div class="form_group">
            <div class="formgp_label"><label for="${id}">${id}:</label></div>
            <input type="text" class="updateOnchange" id="${id}" value="${value}" ${status&&'disabled=true'}>
        </div>
            `
            return formGroupupdate
        } catch (error) {
            errorpopuphtml(error)
            $(".popup_container").show();
        }
    }

    function refreshattachment_list() {
        try {
            let attachobj = JSON.parse(localStorage.getItem("attachmentObj"));


            // document.getElementById("submitfile").disabled = true
            get_attachments(attachobj)
            $('#uploadfiles').unbind('submit')
                // $(this).removeAttr('disabled');
                // document.getElementById("submitfile").disabled = false

        } catch (error) {
            $(".popup_container").show();
        }
    }


    function delete_attachment_from_service(payload) {
        try {

            fetch('https://www.arcgis.com/sharing/rest/generateToken', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(formdata)
                })
                .then(response => response.json())
                .then(response => {
                    var formdata2 = {
                        f: 'json',
                        attachmentIds: payload.id,
                        token: response.token
                    }
                    let qurl = payload.url.split("attachments")[0] + "deleteAttachments"

                    fetch(qurl, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            body: new URLSearchParams(formdata2)
                        })
                        .then(response => response.json()).then(responsedata => {
                            let delete_results = responsedata.deleteAttachmentResults

                            if (delete_results && delete_results.length == 1) {

                                refreshattachment_list()


                                $("#submitfile").children().off();
                                $("#submitfile").find("*").off();

                                attachmentresponsepopuphtml()
                                $(".attachment_container").show();
                                $("#response-ok").click(function() {

                                    $(".attachment_container").hide();
                                })


                                $(".del_close-btn").click(function() {
                                    $(".attachment_container").hide();
                                });
                            }
                        })
                })


        } catch (error) {
            $(".attachment_container").show();
        }


    }

    function delete_attachment() {
        const itemifo = JSON.parse(this.dataset.info)
        deleteattachmenthtml()
        let itemiddiv = document.getElementById("itemName")
        itemiddiv.innerHTML = itemifo.name
        let yes = document.getElementById("del_yes")
        yes.setAttribute('data-info', JSON.stringify(itemifo))
        $(".attachment_container").show();

        $("#del_yes").click(function() {
            let yes = document.getElementById("del_yes")
            let payload = JSON.parse(yes.dataset.info)
            delete_attachment_from_service(payload)
            $(".attachment_container").hide();
        })

        $(".del_close-btn").click(function() {
            $(".attachment_container").hide();
        });



        $("#del_no").click(function() {
            $(".attachment_container").hide();
        })

    }




    function image_thumbnails(imagelist) {

        try {

            fetch('https://www.arcgis.com/sharing/rest/generateToken', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(formdata)
            }).then(response => response.json()).then(response => {
                const attachment_list = []
                let imgdiv = document.querySelector(".image-container")
                imgdiv.innerHTML = ""
                if (imagelist && imagelist.length > 0) {
                    for (let imageobj of imagelist[0].attachmentInfos) {
                        let src = `${imageobj.url}` + "?token=" + `${response.token}`
                        let newname = `${imageobj['name']}`.replaceAll(' ', '_')
                        imageobj['name'] = newname
                        let alt = imageobj.name
                        let formGroupupdate = `
                        <div class="image_card">
                        <div class="delete_image"><span class="del_image-btn" data-info=${JSON.stringify(imageobj)}><span>&times;</span></span></div>
                        <div class="image_box">
                        <a class="image_thumbnail esri-attachments__item-button"  href="${src}"  target="_blank"> 
                        <div class="esri-attachments__item-mask image_mask">
                        <img src="${src}" alt=${alt} title=${alt} class="esri-attachments__image--resizable esri-attachments__image"/>
                        </div>
                        <div class="image_name" >${alt}</div>
                        </a>
                        </div>
                        </div>
                        `
                        attachment_list.push(formGroupupdate)
                    }

                    imgdiv.insertAdjacentHTML('beforeend', attachment_list.join(" "))
                    document.querySelectorAll(".del_image-btn").forEach(el => {
                        el.addEventListener("click", delete_attachment)
                    })
                }
                $('#uploadfiles').unbind('submit')
            })


        } catch (error) {
            errorpopuphtml(error)
            $(".popup_container").show();
        }
    }


    function uploadattachment(queryobj) {
        try {
            if (!eventExist) {
                eventExist = true
                let uploadForm = document.getElementById("uploadfiles");
                uploadForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    var file = e.target.browse_file.files[0]
                    fetch('https://www.arcgis.com/sharing/rest/generateToken', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams(formdata)
                    }).then(response => response.json()).then(response => {
                        let qurl = queryobj.url.split("query")[0] + queryobj.objectId + "/addAttachment"
                        let formData
                        if (formData) {
                            console.log('form data exist')
                            formData.delete('file')
                            formData.delete('token')
                            formData.delete('f')
                        }
                        formData = new FormData();
                        formData.append('file', file)
                        formData.append('f', 'json')
                        formData.append('token', response.token)

                        fetch(qurl, {
                            method: 'POST',
                            body: formData
                        }).then(response => response.json()).then(responsedata => {
                            if (responsedata && responsedata.addAttachmentResult) {
                                $(".upload_label").html("Upload successful")
                                $(".upload_label").addClass("success")
                                $(".upload_label").removeClass("error")
                                refreshattachment_list()
                                $("#submitfile").attr("disabled", true);
                                $("#submitfile").children().off();
                                $("#submitfile").find("*").off();
                                uploadForm.reset();
                            } else {
                                console.log(responsedata.error)
                                $(".upload_label").html("Upload Failed")
                                $(".upload_label").addClass("error")
                                $(".upload_label").removeClass("success")
                            }


                        })



                    })

                })

            }





        } catch (error) {
            console.log(error)
        }

    }

    function editpopuphtml(data) {
        try {
            let popup_container = document.querySelector(".popup_container")
            popup_container.innerHTML = ""
            let edithtml = `
            <div class="edit-popup">
            <div class="titlebar">
                <div class="del_close-btn"><span>&times;</span></div>
                <div class="info-edit">Edit Feature</div>
            </div>

            <div class="feature-list-box">

                <div class="feature-list">
                <div class="features">
                <form class="edit-form">
                        ${data}

                    </form>
                </div>               
                </div>
                <div class="image_section">
                <div class="image_section-header">
                <span>ATTACHMENTS</span>
                <form id="uploadfiles" enctype="multipart/form-data" method="POST" >
                <input type="file" name="file" id="browse_file">
                <div class="submission">
                <button type="submit" id="submitfile" disabled>Upload</button>
                <label for="submitfile" class="upload_label"></label>
                </div>
               
                </form>
                
                </div>
                <div class="image-container">
               
                </div>
            </div>
            </div>
            <div class="button-box">
                <button id="submitform">SAVE</button>
                <button id="cancelform">CANCEL</button>
            </div>
        </div>
        `
            popup_container.insertAdjacentHTML("beforeend", edithtml)
            $("#browse_file").click(function() {
                const layerObj = JSON.parse(localStorage.getItem("attachmentObj"))

                var fileInput = document.getElementById('browse_file');
                fileInput.onchange = function() {
                    $("#submitfile").attr("disabled", true);
                    var input = this.files[0];
                    $(".upload_label").html("")
                    if (input) {
                        $("#submitfile").attr("disabled", false);
                        uploadattachment(layerObj)
                    }
                };



                if ($("#submitfile").is(":disabled")) {
                    $('#uploadfiles').unbind('submit')
                    $("#submitfile").find("*").children().off();
                } else {
                    $("#submitfile").children().off();
                    $('#uploadfiles').unbind('submit')

                }
            })
        } catch (error) {
            console.log(error)
        }
    }



    function get_attachments(queryobj) {
        try {
            fetch('https://www.arcgis.com/sharing/rest/generateToken', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(formdata)
                }).then(response => response.json())
                .then(response => {
                    var attachmentformdata = {
                        query: {
                            f: "json",
                            objectIds: queryobj.objectId,
                            token: response.token,
                            returnUrl: true
                        },
                    };

                    let non_attachment_services = ["verticalecs", "revetment"]
                    if (queryobj.invtype === "collector") {
                        if (!non_attachment_services.includes(queryobj.type)) {
                            let attachurl = queryobj.url.split("query")[0] + "queryAttachments"
                            const requestobj = esriRequest(attachurl, attachmentformdata)
                            requestobj.then(function(response) {
                                image_thumbnails(response.data.attachmentGroups)

                            })
                        }

                    } else if (queryobj.invtype === "survey123") {
                        let attachurl = queryobj.url.split("query")[0] + "queryAttachments"
                        const requestobj = esriRequest(attachurl, attachmentformdata)
                        requestobj.then(function(response) {
                            // console.log(response)
                            // console.log(queryobj)

                            image_thumbnails(response.data.attachmentGroups)

                        })
                    }
                })
        } catch (error) {
            console.log(error)
        }
    }







    function queryFeature(queryobj) {
        try {
            fetch('https://www.arcgis.com/sharing/rest/generateToken', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(formdata)
                })
                .then(response => response.json())
                .then(response => {
                    let options
                        // console.log(queryobj)
                    if (queryobj.invtype === "collector") {
                        options = {
                            query: {
                                f: "json",
                                where: `objectid='${queryobj.objectId}' AND globalId='${queryobj.globalId}'`,
                                token: response.token,
                                returnGeometry: true,
                                outFields: "*"
                            },
                            responseType: "json"
                        };
                    } else {
                        options = {
                            query: {
                                f: "json",
                                where: `objectid='${queryobj.objectId}' AND FeatureID='${queryobj.globalId}'`,
                                token: response.token,
                                returnGeometry: true,
                                outFields: "*"
                            },
                            responseType: "json"
                        };
                    }
                    esriRequest(queryobj.url, options).then(function(response) {
                        let staticFields = ["surveydate", "CreationDate", "Creator", "EditDate", "Editor", "globalid", "GlobalID"]
                        let hiddenFields = ["objectid", "CreationDate", "Creator", "EditDate", "Editor", "globalid", "GlobalIDField", "Shape__Length"]
                        let disabledlist = ["FeatureID", "survey_year", "surveydate", "survey_date", "GlobalID", "OBJECTID", "Inv_Year", "Length_FT"]
                        let selectedFeature = response.data.features[0].attributes

                        let allitems = Object.keys(selectedFeature)
                        let inputdata = []
                        for (let index = 0; index < allitems.length; index++) {
                            const value = selectedFeature[allitems[index]];
                            if (!staticFields.includes(allitems[index])) {
                                state[allitems[index]] = value
                            }
                            if (!hiddenFields.includes(allitems[index])) {
                                if (disabledlist.includes(allitems[index])) {
                                    inputdata.push(formGroupItem(allitems[index], value, true))
                                } else {
                                    inputdata.push(formGroupItem(allitems[index], value, false))
                                }
                            }
                        }
                        field_changed = false
                        copied_state = Object.assign({}, state)

                        editpopuphtml(inputdata.join(''))
                        $(".popup_container").show();
                        $(".del_close-btn").click(function() {
                            $(".popup_container").hide();
                        });
                        $("#cancelform").click(function() {
                            $(".popup_container").hide();
                        });



                        $(document).ready(function() {
                            document.querySelector(".edit-popup").addEventListener('keyup', e => {
                                let inputel = e.target.closest(".updateOnchange")
                                let fields = ["address", "beach", "tms_number"]
                                if (inputel != null) {
                                    let activeInput = inputel.id
                                    state[activeInput] = inputel.value
                                    if (fields.includes(activeInput)) {
                                        if (copied_state[activeInput].trim() === state[activeInput].trim()) {
                                            field_changed = false
                                        } else {
                                            field_changed = true
                                        }
                                    }


                                }
                            })

                            document.querySelector(".edit-popup").addEventListener('click', e => {
                                let inputel = e.target.closest("#submitform")
                                if (inputel != null) {
                                    updateFeature(queryobj)
                                }
                            })
                        });

                        localStorage.removeItem("attachmentObj");
                        localStorage.setItem("attachmentObj", JSON.stringify(queryobj));

                        get_attachments(queryobj) //this should be used to refresh-store in browser


                    });

                })
        } catch (error) {
            errorpopuphtml(error)
            $(".popup_container").show();
        }
    }


    function queryFeatures(year, reqobj) {
        try {

            fetch('https://www.arcgis.com/sharing/rest/generateToken', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(formdata)
                })
                .then(response => response.json())
                .then(response => {

                    let options
                    if (reqobj.inv_type === "collector") {
                        options = {
                            query: {
                                f: "json",
                                where: "1=1",
                                token: response.token,
                                returnGeometry: true,
                                outFields: "*"
                            },
                            responseType: "json"
                        };
                    } else {
                        options = {
                            query: {
                                f: "json",
                                where: `survey_year='${year}'`,
                                token: response.token,
                                returnGeometry: true,
                                outFields: "*"
                            },
                            responseType: "json"
                        };
                    }




                    esriRequest(reqobj.layer, options).then(function(response) {
                        if (reqobj.inv_type === "collector") {
                            refreshCollectorTable(response.data, reqobj)
                        } else {
                            refreshTable(response.data, reqobj)
                        }


                    });
                })
        } catch (error) {
            errorpopuphtml(error)
            $(".popup_container").show();
        }
    }



    function getselection(query) {


        const layers = {
            "survey123": {
                "damage": {
                    "house": "https://services2.0/query",
                    "dbr": "https://services2./0/query",
                    "verticalecs": "https://services2./0/query",
                    "revetment": "https://services2./FeatureServer/0/query",
                    "suspected": "https://services2./0/query",
                    "pool": "https://services2.0/query",
                    "newstructure": "https://services2.0/query",
                    "testhouse": "https://services2./query"
                },
                "structural": {
                    "house": "https://services2./query",
                    "dbr": "https://services2./query",
                    "verticalecs": "https://services2.0/query",
                    "revetment": "https://services2./query",
                    "suspected": "https://services2.0/query",
                    "pool": "https://services2.0/query",
                    "newstructure": "https://services2.0/query",
                    "testhouse": "https://services2.0/query"
                }
            },
            "collector": {
                "damage": {
                    "structural": "https://services2./query",
                    "dbr": "https://services2.query",
                    "verticalecs": "https://services2./query",
                    "revetment": "https://services2.0/query",
                    "suspected": "https://services2./query",
                    "pool": "https://services2.0/query",
                    "newstructure": "https://services2./query",
                    "testhouse": "https://services2.a0/query"
                },
                "structural": {
                    "house": "https://services2./query",
                    "dbr": "https://services2.query",
                    "verticalecs": "https://services2./query",
                    "revetment": "https://services2.0/query",
                    "suspected": "https://services2./query",
                    "pool": "https://services2./query",
                    "newstructure": "https://services2.query",
                    "testhouse": "https://services2./query"
                }
            }



        }

        const in_type = query.inventory_type
        const type = query.type
        const type_endpoints = layers[in_type][type]


        let year = ""
        let layer = ""

        let layerObj = { "layer": "", "name": "", "year": "", "checked": false, "type": "", "inv_type": in_type }
        if (query.year == '2022') {
            year = 2022
        } else if (query.year == '2023') {
            year = 2023
        }
        layerObj.year = year
        if (query.layer == 'dbr') {
            layerObj.type = type
            layer = type_endpoints.dbr
            layerObj.layer = layer
            layerObj.name = 'dbr'
            layerObj.checked = query.checked
        } else if (query.layer == 'house') {
            layerObj.type = type
            layer = type_endpoints.house
            layerObj.layer = layer
            layerObj.name = 'house'
            layerObj.checked = query.checked
        } else if (query.layer == 'verticalecs') {
            layerObj.type = type
            layer = type_endpoints.verticalecs
            layerObj.layer = layer
            layerObj.name = 'verticalecs'
            layerObj.checked = query.checked
        } else if (query.layer == 'revetment') {
            layerObj.type = type
            layer = type_endpoints.revetment
            layerObj.layer = layer
            layerObj.name = 'revetment'
            layerObj.checked = query.checked
        } else if (query.layer == 'pool') {
            layerObj.type = type
            layer = type_endpoints.pool
            layerObj.layer = layer
            layerObj.name = 'pool'
            layerObj.checked = query.checked
        } else if (query.layer == 'suspected') {
            layerObj.type = type
            layer = type_endpoints.suspected
            layerObj.layer = layer
            layerObj.name = 'suspected'
            layerObj.checked = query.checked
        } else if (query.layer == 'newstructure') {
            layerObj.type = type
            layer = type_endpoints.suspected
            layerObj.layer = layer
            layerObj.name = 'newstructure'
            layerObj.checked = query.checked
        } else if (query.layer == 'testhouse') {
            layerObj.type = type
            layer = type_endpoints.testhouse
            layerObj.layer = layer
            layerObj.name = 'testhouse'
            layerObj.checked = query.checked
        }


        return { "year": year, "layerObj": layerObj }
    }


    function refresh() {
        try {
            tableBody.innerHTML = "Processing....."
            if (dataTable) {
                dataTable.clear();
                dataTable.destroy();
            }
            delet = 0
            const year = localStorage.getItem("year");
            const layerObj = localStorage.getItem("layerObj");
            queryFeatures(year, JSON.parse(layerObj))
        } catch (error) {
            errorpopuphtml(error)
            $(".popup_container").show();
        }
    }

    var queryForm = document.getElementById('queryForm');
    queryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        delet = 0
        tableBody.innerHTML = "Processing....."
        if (dataTable) {
            dataTable.clear();
            dataTable.destroy();
        }


        let checkbox = document.getElementById("duplicate-checkbox")

        let selectedinventorytype = e.target.inventory


        if (selectedinventorytype.value === "survey123") {
            if (checkbox.checked) {
                let inventorytype = e.target.inventorytype.value
                if (inventorytype === "damage") {
                    var queryyear = e.target.queryYear.value;
                    var querylayer = e.target.layer.value;
                    const { year, layerObj } = getselection({ "year": queryyear, "layer": querylayer, "type": "damage", "checked": true, "inventory_type": "survey123" })
                    localStorage.clear()
                    localStorage.setItem("year", year);
                    localStorage.setItem("layerObj", JSON.stringify(layerObj));
                    queryFeatures(year, layerObj)
                } else {
                    var queryyear = e.target.queryYear.value;
                    var querylayer = e.target.layer.value;
                    const { year, layerObj } = getselection({ "year": queryyear, "layer": querylayer, "type": "structural", "checked": true, "inventory_type": "survey123" })
                    localStorage.clear()
                    localStorage.setItem("year", year);
                    localStorage.setItem("layerObj", JSON.stringify(layerObj));
                    queryFeatures(year, layerObj)
                }
            } else {
                let inventorytype = e.target.inventorytype.value
                if (inventorytype === "damage") {
                    var queryyear = e.target.queryYear.value;
                    var querylayer = e.target.layer.value;
                    const { year, layerObj } = getselection({ "year": queryyear, "layer": querylayer, "type": "damage", "checked": false, "inventory_type": "survey123" })
                    localStorage.clear()
                    localStorage.setItem("year", year);
                    localStorage.setItem("layerObj", JSON.stringify(layerObj));
                    queryFeatures(year, layerObj)
                } else {
                    var queryyear = e.target.queryYear.value;
                    var querylayer = e.target.layer.value;
                    const { year, layerObj } = getselection({ "year": queryyear, "layer": querylayer, "type": "structural", "checked": false, "inventory_type": "survey123" })
                    localStorage.clear()
                    localStorage.setItem("year", year);
                    localStorage.setItem("layerObj", JSON.stringify(layerObj));
                    queryFeatures(year, layerObj)
                }

            }
        } else {
            if (checkbox.checked) {

                var queryyear = e.target.queryYear.value;
                var querylayer = e.target.layer.value;
                const { year, layerObj } = getselection({ "year": queryyear, "layer": querylayer, "type": "structural", "checked": true, "inventory_type": "collector" })
                localStorage.clear()
                localStorage.setItem("year", year);
                localStorage.setItem("layerObj", JSON.stringify(layerObj));

                queryFeatures(year, layerObj)

            } else {

                var queryyear = e.target.queryYear.value;
                var querylayer = e.target.layer.value;
                const { year, layerObj } = getselection({ "year": queryyear, "layer": querylayer, "type": "structural", "checked": false, "inventory_type": "collector" })
                localStorage.clear()
                localStorage.setItem("year", year);
                localStorage.setItem("layerObj", JSON.stringify(layerObj));
                queryFeatures(year, layerObj)
            }
        }




    });


    function deleteattachmenthtml() {
        try {
            let popup_container = document.querySelector(".attachment_container")
            popup_container.innerHTML = ""
            let attachenethtml = `
                <div class="del_box">
                <div class="titlebar">
                <div class="del_close-btn"><span>&times;</span></div>
                <div class="infobar">DELETE!</div>
            </div>
                <div class="del_content-box">
                    <div class="del_contents"><span>Are you sure you want to delete this attachment?</span><span>Name:<i id="itemName"></i></span></div>
                    <div class="del_buttons">
                        <button id="del_yes">Yes</button>
                        <button id="del_no">No</button>
                    </div>
                </div>
            </div>
        `
            popup_container.insertAdjacentHTML("beforeend", attachenethtml)
        } catch (error) {
            console.log(error)
        }
    }

    function deletepopuphtml() {
        try {
            let popup_container = document.querySelector(".popup_container")
            popup_container.innerHTML = ""
            let deletehtml = `
                <div class="del_box">
                <div class="titlebar">
                <div class="del_close-btn"><span>&times;</span></div>
                <div class="infobar">DELETE!</div>
            </div>
                <div class="del_content-box">
                    <div class="del_contents"><span>Are you sure you want to delete this feature?</span><span>Id:<i id="itemId"></i></span></div>
                    <div class="del_buttons">
                        <button id="del_yes">Yes</button>
                        <button id="del_no">No</button>
                    </div>
                </div>
            </div>
        `
            popup_container.insertAdjacentHTML("beforeend", deletehtml)
        } catch (error) {
            console.log(error)
        }
    }


    function attachmentresponsepopuphtml() {
        try {
            let popup_container = document.querySelector(".attachment_container")
            popup_container.innerHTML = ""
            let responsehtml = `
            <div class="response-popup">
            <div class="titlebar">
                <div class="del_close-btn"><span>&times;</span></div>
                <div class="info">Success!</div>
            </div>
            <div class="response_content-box">
                <div class="del_contents"><span>(1) item deleted successfully!</span></div>
                <div class="response_buttons">
                    <button id="response-ok">OK</button>
                </div>
            </div>
        </div>
        `
            popup_container.insertAdjacentHTML("beforeend", responsehtml)
        } catch (error) {
            console.log(error)
        }
    }

    function responsepopuphtml() {
        try {
            let popup_container = document.querySelector(".popup_container")
            popup_container.innerHTML = ""
            let responsehtml = `
            <div class="response-popup">
            <div class="titlebar">
                <div class="del_close-btn"><span>&times;</span></div>
                <div class="info">Success!</div>
            </div>
            <div class="response_content-box">
                <div class="del_contents"><span>(1) item deleted successfully!</span></div>
                <div class="response_buttons">
                    <button id="response-ok">OK</button>
                </div>
            </div>
        </div>
        `
            popup_container.insertAdjacentHTML("beforeend", responsehtml)
        } catch (error) {
            console.log(error)
        }
    }

    function updateresponsepopuphtml() {
        try {
            let popup_container = document.querySelector(".popup_container")
            popup_container.innerHTML = ""
            let responsehtml = `
            <div class="response-popup">
            <div class="titlebar">
                <div class="del_close-btn"><span>&times;</span></div>
                <div class="info">Success!</div>
            </div>
            <div class="response_content-box">
                <div class="del_contents"><span>(1) item updated successfully!</span></div>
                <div class="response_buttons">
                    <button id="response-ok">OK</button>
                </div>
            </div>
        </div>
        `
            popup_container.insertAdjacentHTML("beforeend", responsehtml)
        } catch (error) {
            console.log(error)
        }
    }

    function errorpopuphtml(error) {
        try {
            let popup_container = document.querySelector(".popup_container")
            popup_container.innerHTML = ""
            let errorhtml = `
            <div class="error-popup">
            <div class="titlebar">
                <div class="del_close-btn"><span>&times;</span></div>
                <div class="infobar">ERROR!</div>
            </div>

            <div class="error_content-box">
                <div class="error_contents"><span>${error}/span></div>
                <div class="response_buttons">
                    <button id="response-ok">OK</button>
                </div>
            </div>
        </div>
        `
            popup_container.insertAdjacentHTML("beforeend", errorhtml)
        } catch (error) {
            console.log(error)
        }
    }




    function find_duplicates(data) {
        try {
            let duplicates = {}
            let selectedIds = []
            for (let index = 0; index < data.length; index++) {
                const feature = data[index];
                let featureId = feature.attributes["FeatureID"]
                if (duplicates[featureId]) {
                    duplicates[featureId].push(featureId)
                } else {
                    duplicates[featureId] = [featureId]
                }
            }
            for (let key in duplicates) {
                if (duplicates[key].length > 1) {
                    selectedIds.push(key)
                }
            }
            let selectedFeatures = data.filter((feat) => selectedIds.includes(feat.attributes["FeatureID"]))
            return selectedFeatures


        } catch (error) {
            console.log(error)
        }
    }



    function get_notes(feature, layerobj) {
        try {
            let wordcount = []
            let wordlength = 0
            let notes = ""
            let wordlen = 35
            let layername = layerobj.name
            if (layerobj.type === "damage") {

                if (layername === "testhouse") {
                    notes = "house_notes"
                } else {
                    notes = "notes"
                }

            } else {
                if (layername === "pool") {
                    notes = "pool_notes"
                } else if (layername === "house") {
                    notes = "house_notes"
                } else if (layername === "verticalecs") {
                    notes = "notes"
                } else if (layername === "revetment") {
                    notes = "notes"
                } else if (layername === "suspected") {
                    notes = "notes"
                } else if (layername === "dbr") {
                    notes = "notes"
                } else if (layername === "testhouse") {
                    notes = "house_notes"

                } else {
                    notes = "notes"
                }
            }


            if (feature.attributes[notes] != null && feature.attributes[notes].length > 1) {
                if (feature.attributes[notes].toLowerCase().includes("delete")) {
                    delet = delet + 1
                }
                let wordsplit = feature.attributes[notes].split(" ")
                for (let word of wordsplit) {
                    wordlength = wordlength + word.length
                    if (wordlength + word.length < wordlen) {
                        wordcount.push(word)
                    }
                }
                if (wordlength > wordlen) {
                    if (feature.attributes[notes].toLowerCase().includes("delete")) {

                        let longpath = feature.attributes[notes]
                        let shortpath = wordcount.join(" ") + "... delete"
                        return [longpath, shortpath]
                            // return wordcount.join(" ") + "... delete"
                    } else {
                        let longpath = feature.attributes[notes]
                        let shortpath = wordcount.join(" ") + "...."
                        return [longpath, shortpath]
                            // return wordcount.join(" ") + "...."
                    }


                } else {
                    let longpath = feature.attributes[notes]
                    let shortpath = feature.attributes[notes]
                    return [longpath, shortpath]


                }
            } else {
                let longpath = null
                let shortpath = null
                return [longpath, shortpath]
                    // return null
            }

        } catch (error) {
            console.log(error)
        }
    }



    function get_time(feature, layerobj) {
        let outfeaturename = ["newstructure", "pool", "house", "verticalecs", "revetment", "suspected"]
            // console.log(feature)
        try {
            let surveydate = ""
            if (layerobj.type === "damage" && outfeaturename.includes(layerobj.name)) {
                surveydate = "survey_date"
            } else {
                surveydate = "surveydate"
            }
            let timestamp = feature[surveydate]
            if (timestamp != null) {
                var datef = new Date(timestamp).toLocaleDateString("en-US")
                let time = new Date(timestamp).toLocaleTimeString("en-US")
                let ndatetime = `${datef}-${time}`
                return ndatetime
            }
        } catch (error) {
            console.log(error)
        }
    }




    function refreshCollectorTable(response, layerobj) {
        var features
        if (layerobj.checked) {
            features = find_duplicates(response.features)
        } else {
            features = response.features
        }


        var tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = "Processing....."
        var recordCount = features.length;
        var featureTableDisplay = recordCount > 0 ? 'table' : 'none';
        document.getElementById('featureTable').style.display = featureTableDisplay;


        let tablehead = document.getElementById("table_head")
        tablehead.innerHTML = ""
        let header_row = "<tr><th>Action</th><th>Global ID</th><th>Address</th><th>Feat_ID</th><th>Beach</th></tr>"
        tablehead.insertAdjacentHTML("beforeend", header_row)
        var rows = features.map(function(feature) {

            return `<tr> <td class="action_col"><div  class="action_icon"><span title="Delete"><svg class="delete_icon icn_moon" data-globalId=${feature.attributes.GlobalID}  data-url=${layerobj.layer} 
            data-structure=${layerobj.name}  data-year=${layerobj.year} id=del_${feature.attributes.OBJECTID}><use  xlink:href="img/sprite.svg#icon-bin"></use></svg></span>
            <span title="Edit"><svg class="update_icon icn_moon" data-globalId=${feature.attributes.GlobalID} data-invtype=${layerobj.inv_type}  data-url=${layerobj.layer} data-structure=${layerobj.name} data-invtype=${layerobj.inv_type}  data-year=${layerobj.year} id=upd_${feature.attributes.OBJECTID}><use xlink:href="img/sprite.svg#icon-pencil2"></use></svg></span>` + '</div><td>' +
                feature.attributes.GlobalID + '</td><td>' + feature.attributes.ADDRESS + '</td><td>' + feature.attributes.FEAT_ID + '</td><td>' + feature.attributes.BEACH + '</td></tr>';
        });

        let allrows = rows.join('');

        $(document).ready(function() {
            var tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = "Processing....."

            tableBody.innerHTML = allrows
            dataTable = $('#featureTable').DataTable();

            if (delet > 0) {
                $(".number").show()
                document.getElementById("chat_number").innerHTML = delet
            } else {
                $(".number").hide()
            }

        });


        document.getElementById('recordCountMessage').innerHTML = recordCount + ' record(s) returned.';
        // show/hide additional messages

        var additionalRowsMessageDisplay = response.exceededTransferLimit ? 'block' : 'none';

        document.getElementById('additionalRowsMessage').style.display = additionalRowsMessageDisplay;

    }

    function refreshTable(response, layerobj) {
        var features
        if (layerobj.checked) {
            features = find_duplicates(response.features)
        } else {
            features = response.features
        }
        var tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = "Processing....."
        var recordCount = features.length;
        var featureTableDisplay = recordCount > 0 ? 'table' : 'none';
        document.getElementById('featureTable').style.display = featureTableDisplay;
        let tablehead = document.getElementById("table_head")
        tablehead.innerHTML = ""
        let header_row = "<tr><th>Action</th><th>Global ID</th><th>Address</th> <th>Beach</th> <th>Survey Year</th> <th>DateTime</th><th>Notes</th></tr>"

        tablehead.insertAdjacentHTML("beforeend", header_row)
        var rows = features.map(function(feature) {
            let [longpath, shortpath] = get_notes(feature, layerobj)
            return `<tr> <td class="action_col"><div  class="action_icon"><span title="Delete"><svg class="delete_icon icn_moon" data-invtype=${layerobj.inv_type}  data-globalId=${feature.attributes.FeatureID} data-url=${layerobj.layer} data-structure=${layerobj.name} data-year=${layerobj.year} id=del_${feature.attributes.objectid}><use  xlink:href="img/sprite.svg#icon-bin"></use></svg></span><span title="Edit"><svg class="update_icon icn_moon" data-globalId=${feature.attributes.FeatureID} data-url=${layerobj.layer} data-structure=${layerobj.name} data-invtype=${layerobj.inv_type}  data-year=${layerobj.year} id=upd_${feature.attributes.objectid}><use xlink:href="img/sprite.svg#icon-pencil2"></use></svg></span>` + '</div><td>' +
                feature.attributes.FeatureID + '</td><td>' + feature.attributes.address + '</td><td>' + feature.attributes.beach + '</td><td>' +
                feature.attributes.survey_year + '</td><td>' + get_time(feature.attributes, layerobj) + `</td><td><a title="${longpath}">` + shortpath +
                '</a></td></tr>';

        });

        let allrows = rows.join('');

        $(document).ready(function() {
            var tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = "Processing....."

            tableBody.innerHTML = allrows
            dataTable = $('#featureTable').DataTable();

            if (delet > 0) {
                $(".number").show()
                document.getElementById("chat_number").innerHTML = delet
            } else {
                $(".number").hide()
            }



        });


        document.getElementById('recordCountMessage').innerHTML = recordCount + ' record(s) returned.';
        // show/hide additional messages

        var additionalRowsMessageDisplay = response.exceededTransferLimit ? 'block' : 'none';

        document.getElementById('additionalRowsMessage').style.display = additionalRowsMessageDisplay;

    }




    document.getElementById("featureTable").addEventListener("click", event => {
        let target = event.target.closest(".icn_moon")
        if (target != null) {
            let actiontype = target.id.split("_")[0]

            if (actiontype === 'del') {
                deletepopuphtml()
                let selection = null
                let url = target.dataset.url
                let invtype = target.dataset.invtype
                let structure = target.dataset.structure
                let year = target.dataset.year
                let objectId = target.id.split("_")[1]
                let itemId = target.dataset.globalid
                let itemiddiv = document.getElementById("itemId")
                selection = { "url": url, "type": structure, "year": year, "globalId": itemId, "objectId": objectId, "invtype": invtype }
                itemiddiv.innerHTML = itemId
                let yes = document.getElementById("del_yes")
                yes.setAttribute('data-feature', JSON.stringify(selection))
                $(".popup_container").show();

            } else if (actiontype === 'upd') {
                let selection = null

                let invtype = target.dataset.invtype

                let url = target.dataset.url
                let structure = target.dataset.structure
                let year = target.dataset.year
                let objectId = target.id.split("_")[1]
                let itemId = target.dataset.globalid
                selection = { "url": url, "type": structure, "year": year, "globalId": itemId, "objectId": objectId, "invtype": invtype }

                queryFeature(selection)
            }


            $("#del_yes").click(function() {
                let yes = document.getElementById("del_yes")
                let payload = JSON.parse(yes.dataset.feature)
                deleteFeature(payload)
                $(".popup_container").hide();
            })

            $(".del_close-btn").click(function() {
                $(".popup_container").hide();
            });



            $("#del_no").click(function() {
                $(".popup_container").hide();
            })




        }
    })


    $("#duplicate-checkbox").change(function() {
        if (this.checked) {
            $("#active_header").html("View Duplicates!")
        } else {
            $("#active_header").html("Survey Data Explorer!")
        }

    })

});