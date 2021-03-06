import $ from "jquery";
import resizeCallbacks from "core/utils/resize_callbacks";
import consoleUtils from "core/utils/console";
import windowUtils from "core/utils/window";
import responsiveBoxScreenMock from "../../helpers/responsiveBoxScreenMock.js";
import typeUtils from "core/utils/type";
import config from "core/config";
import { __internals as internals } from "ui/form/ui.form";

import "ui/text_area";

import "common.css!";
import "generic_light.css!";

const { test } = QUnit;

QUnit.testStart(() => {
    const markup =
        '<div id="form"></div>';

    $("#qunit-fixture").html(markup);
});

QUnit.module("Form", () => {
    test("Invalidate after option changed", (assert) => {
        // arrange
        let testingOptions = ["formData", "items", "colCount", "onFieldDataChanged", "labelLocation",
                "alignItemLabels", "showColonAfterLabel", "customizeItem", "minColWidth", "alignItemLabelsInAllGroups", "onEditorEnterKey", "scrollingEnabled", "formID"],
            form = $("#form").dxForm().dxForm("instance"),
            i,
            invalidateStub = sinon.stub(form, "_invalidate");

        // act
        for(i = 0; i < testingOptions.length; i++) {
            let testingOption = testingOptions[i],
                value;

            switch(testingOption) {
                case "formData":
                    value = { name: "auto" };
                    break;
                case "items":
                    value = ["auto"];
                    break;
                default:
                    value = "auto";
            }

            form.option(testingOption, value);
        }

        // assert
        assert.equal(invalidateStub.callCount, testingOptions.length);
    });

    test("Invalidate is not called when formData is changed and items option is defined", (assert) => {
        // arrange
        let form = $("#form").dxForm({
                items: [
                    {
                        dataField: "name",
                        editorType: "dxTextBox"
                    }
                ]
            }).dxForm("instance"), invalidateStub = sinon.stub(form, "_invalidate");

        // act
        form.option("formData", {
            name: "test"
        });

        // assert
        assert.equal(invalidateStub.callCount, 0);
    });

    test("Default render", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
            items: [
                {
                    dataField: "name",
                    editorType: "dxTextBox"
                }
            ]
        });

        // assert
        assert.ok($formContainer.hasClass(internals.FORM_CLASS), "Form is rendered");
        assert.equal($formContainer.attr("role"), "form", "Form has correct attribute");
        assert.equal($formContainer.find("." + internals.FORM_LAYOUT_MANAGER_CLASS).length, 1, "Layout manager is rendered");
    });

    test("Check the default focus target", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
            items: [
                {
                    dataField: "name",
                    editorType: "dxTextBox"
                }
            ]
        });

        // assert
        let $input = $formContainer.find("input");

        assert.equal($formContainer.dxForm("instance")._focusTarget().closest(".dx-widget").html(), $input.closest(".dx-widget").html(), "Correct focus target");
    });

    test("Check root layout width on option change", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                items: [
                    {
                        dataField: "name",
                        editorType: "dxTextBox"
                    }
                ]
            }),
            instance = $formContainer.dxForm("instance"),
            rootLayoutManager = instance._rootLayoutManager;

        instance.option("width", 100);

        // assert
        assert.equal(rootLayoutManager.option("width"), 100, "Correct width");
    });

    test("Form isn't refresh on dimension changed if colCount is auto", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                colCount: "auto",
                items: [
                    {
                        dataField: "name",
                        editorType: "dxTextBox"
                    }
                ]
            }),
            instance = $formContainer.dxForm("instance"),
            refreshStub = sinon.stub(instance, "_refresh");

        resizeCallbacks.fire();

        // assert
        assert.equal(refreshStub.callCount, 0, "don't refresh on resize if colCount is auto");
    });

    test("Form doesn't refresh on dimension changed if colCount is not auto", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                items: [
                    {
                        dataField: "name",
                        editorType: "dxTextBox"
                    }
                ]
            }),
            instance = $formContainer.dxForm("instance"),
            refreshStub = sinon.stub(instance, "_refresh");


        resizeCallbacks.fire();

        // assert
        assert.equal(refreshStub.callCount, 0, "do not refresh on resize if colCount isn't auto");
    });

    test("Render read only form", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
            readOnly: true,
            items: [
                {
                    dataField: "name",
                    editorType: "dxTextBox"
                }
            ]
        });

        // assert
        assert.ok($formContainer.find("." + internals.FIELD_ITEM_CLASS + " .dx-texteditor").hasClass("dx-state-readonly"), "editor is read only");
    });

    test("Render form with colspan", (assert) => {
        // arrange, act
        let $testContainer = $("#form");

        $testContainer.dxForm({
            formData: { ID: 0, FirstName: "John", LastName: "Dow", HireDate: "01/01/1970" },
            colCount: 2,
            colCountByScreen: { xs: 2 },
            items: [{
                itemType: "group",
                caption: "Employee",
                colCount: 2,
                items: [
                    { dataField: "ID", colSpan: 2 },
                    { dataField: "FirstName", visible: true },
                    { dataField: "LastName", visible: true },
                    { dataField: "HireDate", colSpan: 2, visible: true }
                ]
            }]
        });

        let $fieldItems = $testContainer.find("." + internals.FIELD_ITEM_CLASS);

        // assert
        assert.equal($fieldItems.length, 5, "4 simple items + 1 group item");
    });

    test("'readOnly' is changed in inner components on optionChanged", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
            items: [
                {
                    dataField: "name",
                    editorType: "dxTextBox"
                }
            ]
        });

        assert.notOk($formContainer.find("." + internals.FIELD_ITEM_CLASS + " .dx-texteditor").hasClass("dx-state-readonly"), "editor isn't read only");

        $formContainer.dxForm("instance").option("readOnly", true);

        // assert
        assert.ok($formContainer.find("." + internals.FIELD_ITEM_CLASS + " .dx-texteditor").hasClass("dx-state-readonly"), "editor is read only");
    });

    test("'disable' is changed in inner components on optionChanged", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
            items: [
                {
                    dataField: "name",
                    editorType: "dxTextBox"
                }
            ],
            disabled: true
        });

        assert.ok($formContainer.find("." + internals.FIELD_ITEM_CLASS + " .dx-texteditor").hasClass("dx-state-disabled"), "editor is disabled");

        $formContainer.dxForm("instance").option("disabled", false);

        // assert
        assert.notOk($formContainer.find("." + internals.FIELD_ITEM_CLASS + " .dx-texteditor").hasClass("dx-state-disabled"), "editor isn't disabled");
    });

    test("Customize item event", (assert) => {
        // arrange, act
        let testObject = {
                ID: 1,
                FirstName: "John",
                LastName: "Heart",
                BirthDate: "1964/03/16",
                Sex: true
            },
            $formContainer = $("#form").dxForm({
                formData: testObject,
                customizeItem: (item) => {
                    switch(item.dataField) {
                        case "Sex":
                        case "ID":
                            item.visible = false;
                            break;
                        case "FirstName":
                            item.editorOptions = {
                                readOnly: true
                            };
                            break;
                        case "LastName":
                            item.editorType = "dxTextArea";
                            break;
                        case "BirthDate":
                            item.editorType = "dxDateBox";
                            break;
                    }
                }
            });

        let items = $formContainer.find("." + internals.FORM_LAYOUT_MANAGER_CLASS).first().dxLayoutManager("instance")._items,
            visibleItems = $formContainer.find("." + internals.FIELD_ITEM_CLASS);

        // assert
        assert.equal(items.length, 3, "items count");
        assert.equal(visibleItems.length, 3, "Visible items count");
        assert.equal(items[0].editorOptions.readOnly, true);
        assert.equal(items[1].editorType, "dxTextArea");
        assert.equal(items[2].editorType, "dxDateBox");

    });

    test("Check that data fully changes after object replace", (assert) => {
        // arrange
        let $testContainer = $("#form");

        $testContainer.dxForm({
            formData: { FamousPirate: "John Morgan" }
        });

        // act
        $testContainer.dxForm("instance").option("formData", { FamousDetective: "Sherlock Holmes" });

        // assert
        assert.deepEqual($testContainer.dxForm("instance").option("formData"), { FamousDetective: "Sherlock Holmes" }, "Correct formData");

    });

    test("Check data at render with items", (assert) => {
        // arrange, act
        let $testContainer = $("#form");

        $testContainer.dxForm({
            formData: { FamousPirate: "John Morgan" },
            items: [{ dataField: "FamousDetective", editorType: "dxTextBox" }, { dataField: "FamousPirate", editorType: "dxTextBox" }]
        });

        // assert
        assert.deepEqual($testContainer.dxForm("instance").option("formData"), { FamousPirate: "John Morgan" }, "Correct formData");
        assert.deepEqual($testContainer.find(".dx-layout-manager").dxLayoutManager("instance").option("layoutData"), { FamousPirate: "John Morgan" }, "Correct formData");
    });

    test("Check data at render with items and change widget's value", (assert) => {
        // arrange
        let $testContainer = $("#form");

        $testContainer.dxForm({
            formData: { FamousPirate: "John Morgan" },
            items: [{ dataField: "FamousDetective", editorType: "dxTextBox" }, { dataField: "FamousPirate" }]
        });

        // act
        $testContainer.find(".dx-textbox").first().dxTextBox("instance").option("value", "Sherlock Holmes");

        // assert
        assert.deepEqual($testContainer.dxForm("instance").option("formData"), { FamousPirate: "John Morgan", FamousDetective: "Sherlock Holmes" }, "Correct formData");
    });

    test("Change of editor's value changing 'formData' option", (assert) => {
        // arrange
        let $testContainer = $("#form");

        $testContainer.dxForm({
            formData: { FamousPirate: "John Morgan" }
        });

        // act
        $testContainer.find(".dx-textbox").dxTextBox("instance").option("value", "Cpt. Jack Sparrow");

        // assert
        assert.deepEqual($testContainer.dxForm("instance").option("formData"), { FamousPirate: "Cpt. Jack Sparrow" }, "Correct formData");
    });

    test("Update of editor's value when formOption is changed and items is defined", (assert) => {
        // arrange
        let $testContainer = $("#form"),
            form,
            $textBoxes,
            textBoxes = [];

        form = $testContainer.dxForm({
            items: ["name", "lastName"]
        }).dxForm("instance");

        sinon.spy(form._rootLayoutManager, "_invalidate");

        $textBoxes = $testContainer.find(".dx-textbox");
        $.each($textBoxes, (_, element) => {
            textBoxes.push($(element).dxTextBox("instance"));
        });

        // act
        form.option("formData", {
            name: "Test Name",
            lastName: "Test Last Name"
        });

        // assert
        assert.equal(textBoxes[0].option("value"), "Test Name", "first editor");
        assert.equal(textBoxes[1].option("value"), "Test Last Name", "second editor");
        assert.ok(!form._rootLayoutManager._invalidate.called, "_invalidate of layout manger is not called");
    });

    test("Check the work of onFieldDataChanged", (assert) => {
        // arrange
        let $testContainer = $("#form"),
            testObject,
            callCount = 0;

        $testContainer.dxForm({
            formData: { FamousPirate: "John Morgan" },
            onFieldDataChanged: (args) => {
                testObject = { dataField: args.dataField, value: args.value };
                callCount++;
            }
        });

        let form = $testContainer.dxForm("instance");

        // act, assert
        $testContainer.find(".dx-textbox").dxTextBox("instance").option("value", "Cpt. Jack Sparrow");

        assert.deepEqual(testObject, { dataField: "FamousPirate", value: "Cpt. Jack Sparrow" }, "Correct data");
        assert.equal(callCount, 1, "onFieldDataChanged called 1 time");

        form.option("formData.FamousPirate", "Blackbeard");

        assert.deepEqual(testObject, { dataField: "FamousPirate", value: "Blackbeard" }, "Correct data");
        assert.equal(callCount, 2, "onFieldDataChanged called 2 times");

        form.option("formData", { FamousDetective: "Sherlock Holmes" });
        assert.equal(callCount, 3, "onFieldDataChanged called 3 times");
    });

    test("Check the work of onFieldDataChanged with complex dataField", (assert) => {
        // arrange
        let $testContainer = $("#form"),
            testObject,
            callCount = 0;

        $testContainer.dxForm({
            formData: { FamousPirate: { firstName: "John", lastName: "Morgan" } },
            items: [
                {
                    itemType: "group",
                    caption: "Famous Pirate",
                    items: [
                        { dataField: "FamousPirate.firstName" },
                        { dataField: "FamousPirate.lastName" }
                    ]
                }
            ],
            onFieldDataChanged: (args) => {
                testObject = { dataField: args.dataField, value: args.value };
                callCount++;
            }
        });

        let form = $testContainer.dxForm("instance");

        // act, assert
        $testContainer.find(".dx-textbox").first().dxTextBox("instance").option("value", "Cpt. Jack");

        assert.deepEqual(testObject, { dataField: "FamousPirate.firstName", value: "Cpt. Jack" }, "Correct data");
        assert.equal(callCount, 1, "onFieldDataChanged called 1 time");

        form.option("formData.FamousPirate.lastName", "Sparrow");

        assert.deepEqual(testObject, { dataField: "FamousPirate.lastName", value: "Sparrow" }, "Correct data");
        assert.equal(callCount, 2, "onFieldDataChanged called 2 times");
    });

    test("Check the work of onFieldDataChanged when whole object is changed", (assert) => {
        // arrange
        let $testContainer = $("#form"),
            testObjects = [];

        $testContainer.dxForm({
            formData: { famousPirate: "John Morgan" },
            onFieldDataChanged: (args) => {
                testObjects.push({ dataField: args.dataField, value: args.value });
            }
        });

        let form = $testContainer.dxForm("instance");

        // act, assert

        form.option("formData", { famousPirate: "Blackbeard", famousDetective: "Sherlock Holmes" });

        assert.equal(testObjects.length, 2, "onFieldDataChanged fire by 2 fields");

        assert.deepEqual(testObjects[0], { dataField: "famousPirate", value: "Blackbeard" }, "Correct data");
        assert.deepEqual(testObjects[1], { dataField: "famousDetective", value: "Sherlock Holmes" }, "Correct data");
    });

    test("Check the work of onFieldDataChanged when whole object is changed and items are defined", (assert) => {
        // arrange
        let $testContainer = $("#form"),
            testObjects = [];

        $testContainer.dxForm({
            formData: { famousPirate: "Blackbeard", famousDetective: "Sherlock Holmes" },
            items: ["famousPirate"],
            onFieldDataChanged: (args) => {
                testObjects.push({ dataField: args.dataField, value: args.value });
            }
        });

        let form = $testContainer.dxForm("instance");
        // act
        form.option("formData", { famousPirate: "Calico Jack", famousDetective: "Hercule Poirot" });

        // assert
        assert.equal(testObjects.length, 2, "onFieldDataChanged fired 2 times");
    });

    test("Check the onFieldDataChanged resets old subscriptions", (assert) => {
        // arrange
        let $testContainer = $("#form"),
            testObjects = [];

        $testContainer.dxForm({
            formData: { famousPirate: "Blackbeard", famousDetective: "Sherlock Holmes" },
            items: ["famousPirate"],
            onFieldDataChanged: (args) => {
                testObjects.push({ dataField: args.dataField, value: args.value });
            }
        });

        let form = $testContainer.dxForm("instance");

        // act
        form.option({
            formData: { famousPirate: "Blackbeard", famousDetective: "Sherlock Holmes" },
            onFieldDataChanged: (args) => {
                testObjects.push({ dataField: args.dataField, value: args.value });
            }
        });
        form.option({
            formData: { famousPirate: "Blackbeard", famousDetective: "Sherlock Holmes" },
            onFieldDataChanged: (args) => {
                testObjects.push({ dataField: args.dataField, value: args.value });
            }
        });

        // assert
        assert.equal(testObjects.length, 4, "onFieldDataChanged fired 4 times");
    });

    test("alignItemLabels option for not grouping", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                formData: { name: "Test", lastName: "surname" }
            }),
            $layoutManager = $formContainer.find("." + internals.FORM_LAYOUT_MANAGER_CLASS).first().dxLayoutManager("instance");

        // assert
        assert.equal($layoutManager.option("alignItemLabels"), true);
    });

    test("Render scrollable", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
            height: 200,
            scrollingEnabled: true,
            formData: {
                "ID": 1,
                "FirstName": "John",
                "LastName": "Heart",
                "Prefix": "Mr.",
                "Position": "CEO",
                "Picture": "images/employees/01.png",
                "BirthDate": "1964/03/16",
                "HireDate": "1995/01/15",
                "Notes": "John has been in the Audio/Video industry since 1990. He has led DevAv as its CEO since 2003.\r\n\r\nWhen not working hard as the CEO, John loves to golf and bowl. He once bowled a perfect game of 300.",
                "Address": "351 S Hill St.",
                "StateID": 5
            }
        });

        // assert
        assert.ok($formContainer.hasClass("dx-scrollable"), "has scrollable");
        assert.equal($formContainer.find(".dx-scrollable-content > ." + internals.FORM_LAYOUT_MANAGER_CLASS).length, 1, "scrollable content");
    });

    test("Check validation error when validationRules are not defined for any item", (assert) => {
        // arrange, act
        let $testContainer = $("#form"),
            errorMessage,
            _error = consoleUtils.logger.log,
            instance;

        consoleUtils.logger.error = (message) => {
            errorMessage = message;
        };

        instance = $testContainer
            .dxForm({
                layoutData: {
                    lastName: "Kyle",
                    firstName: "Logan"
                },
                items: [
                    { dataField: "lastName" },
                    { dataField: "firstName" }
                ]
            })
            .dxForm("instance");

        instance.validate();

        // assert
        assert.equal(errorMessage.indexOf("E1036 - Validation rules are not defined for any form item"), 0);
        assert.ok(errorMessage.indexOf("See:\nhttp://js.devexpress.com/error/") > 0);

        consoleUtils.logger.error = _error;
    });

    test("Default validation group", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
            items: [
                {
                    dataField: "name",
                    isRequired: true
                }
            ]
        });

        // assert
        let validator = $formContainer.find(".dx-validator").dxValidator("instance");
        assert.equal(validator.option("validationGroup"), $formContainer.dxForm("instance"));
    });

    test("Set external validation group name", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
            validationGroup: "Test Validation Group",
            items: [
                {
                    dataField: "name",
                    isRequired: true
                }
            ]
        });

        // assert
        let validator = $formContainer.find(".dx-validator").dxValidator("instance");
        assert.equal(validator.option("validationGroup"), "Test Validation Group");
    });

    test("Show validation summary", (assert) => {
        // arrange
        let $formContainer = $("#form").dxForm({
                showValidationSummary: true,
                items: [
                    {
                        dataField: "name",
                        editorType: "dxTextBox",
                        validationRules: [{
                            type: "required"
                        }]
                    }
                ]
            }),
            $summaryContents;

        // act
        $formContainer.dxForm("instance").validate();
        $summaryContents = $formContainer.find(".dx-validationsummary-item-content");

        // assert
        assert.equal($formContainer.find(".dx-validationsummary").length, 1);
        assert.equal($summaryContents.eq(0).text(), "Required", "summary item");
    });

    test("Show validation summary with a custom validation group", (assert) => {
        // arrange
        let $formContainer = $("#form").dxForm({
            validationGroup: "Custom validation group",
            showValidationSummary: true,
            items: [
                {
                    dataField: "name",
                    isRequired: true
                }
            ]
        });

        // act
        $formContainer.dxForm("instance").validate();

        // assert
        let $validationSummary = $formContainer.find(".dx-validationsummary");
        assert.equal($validationSummary.length, 1);
        assert.equal($validationSummary.dxValidationSummary("instance").option("validationGroup"), "Custom validation group", "validation group");
    });

    test("Show validation summary via option method", (assert) => {
        // arrange
        let $formContainer = $("#form").dxForm({
            showValidationSummary: false,
            items: [
                {
                    dataField: "name",
                    editorType: "dxTextBox"
                }
            ]
        });

        // act
        $formContainer.dxForm("instance").option("showValidationSummary", true);

        // assert
        assert.equal($formContainer.find(".dx-validationsummary").length, 1);
    });

    test("Hide validation summary via option method", (assert) => {
        // arrange
        let $formContainer = $("#form").dxForm({
            showValidationSummary: true,
            items: [
                {
                    dataField: "name",
                    editorType: "dxTextBox"
                }
            ]
        });

        // act
        $formContainer.dxForm("instance").option("showValidationSummary", false);

        // assert
        assert.equal($formContainer.find("form .dx-validationsummary").length, 0);
    });

    test("The dxForm is not rendered correctly when colCount is zero", (assert) => {
        // arrange, act
        let form = $("#form").dxForm({
            formData: { name: "Batman" },
            colCount: 0
        }).dxForm("instance");

        // assert
        assert.equal($("#form .dx-textbox").dxTextBox("option", "value"), "Batman");
        assert.equal(form.$element().find("." + internals.FORM_FIELD_ITEM_COL_CLASS + "0").length, 1);

        // act
        form.option("colCount", 1);
        form.option("colCount", 0);

        // assert
        assert.equal($("#form .dx-textbox").dxTextBox("option", "value"), "Batman");
        assert.equal(form.$element().find("." + internals.FORM_FIELD_ITEM_COL_CLASS + "0").length, 1);
    });

    test("Render form item with specific class", (assert) => {
        // arrange, act
        let $testContainer = $("#form").dxForm({
            items: [
                {
                    itemType: "group",
                    cssClass: "custom-group-class",
                    items: [
                        {
                            label: { text: "New label" },
                            dataField: "name",
                            editorType: "dxTextBox",
                            cssClass: "myFavoriteItem"
                        },
                        {
                            itemType: "empty",
                            cssClass: "custom-empty-class"
                        },
                        {
                            itemType: "tabbed",
                            tabPanelOptions: { deferRendering: windowUtils.hasWindow() ? true : false },
                            cssClass: "custom-tabbed-class",
                            tabs: [{
                                title: "test",
                                items: [
                                    {
                                        label: { text: "Newest label" },
                                        dataField: "name",
                                        editorType: "dxTextBox",
                                        cssClass: "newItem"
                                    }
                                ]
                            }]
                        }
                    ]
                }
            ]
        });

        // assert
        assert.equal($testContainer.find("." + internals.FIELD_ITEM_CLASS + ".custom-group-class").length, 1, "custom class for group");
        assert.equal($testContainer.find("." + internals.FIELD_ITEM_CLASS + ".myFavoriteItem").length, 1, "custom class for item in group");
        assert.equal($testContainer.find("." + internals.FIELD_ITEM_CLASS + ".custom-tabbed-class").length, 1, "custom class for tabbed");
        assert.equal($testContainer.find("." + internals.FIELD_ITEM_CLASS + " .custom-empty-class").length, 1, "custom class for empty");
    });

    test("Validation boundary for editors when scrolling is enabled_T306331", (assert) => {
        // arrange
        let form = $("#form").dxForm({
            scrollingEnabled: true,
            formData: { id: 1, name: "" },
            items: [
                "id",
                {
                    dataField: "name",
                    editorType: "dxTextBox",
                    validationRules: [{
                        type: "required"
                    }]
                }
            ]
        }).dxForm("instance");

        // act
        form.validate();

        // assert
        let $editors = $("#form .dx-texteditor");
        assert.equal($editors.eq(0).dxNumberBox("option", "validationBoundary"), form.$element());
        assert.equal($editors.eq(1).dxTextBox("option", "validationBoundary"), form.$element());
    });

    test("Validation boundary for editors when scrolling is disabled_T306331", (assert) => {
        // arrange
        let form = $("#form").dxForm({
            scrollingEnabled: false,
            formData: { id: 1, name: "" },
            items: [
                "id",
                {
                    dataField: "name",
                    editorType: "dxTextBox",
                    validationRules: [{
                        type: "required"
                    }]
                }
            ]
        }).dxForm("instance");

        // act
        form.validate();

        // assert
        let $editors = $("#form .dx-texteditor");
        assert.equal($editors.eq(0).dxNumberBox("option", "validationBoundary"), undefined);
        assert.equal($editors.eq(1).dxTextBox("option", "validationBoundary"), undefined);
    });

    test("button item should have a Form's validation group by default", (assert) => {
        // arrange, act
        let $testContainer = $("#form"),
            form = $testContainer.dxForm({
                items: [{
                    itemType: "button"
                }, {
                    itemType: "button",
                    buttonOptions: { validationGroup: "test" }
                }]
            }).dxForm("instance"),
            $buttons = $testContainer.find(".dx-button"),
            defaultValidationGroup = form._getValidationGroup(),
            firstButtonValidationGroup = $buttons.first().dxButton("option", "validationGroup"),
            secondButtonValidationGroup = $buttons.last().dxButton("option", "validationGroup");

        // assert
        assert.deepEqual(firstButtonValidationGroup, defaultValidationGroup, "default validation group");
        assert.equal(secondButtonValidationGroup, "test", "Custom validation group");
    });

    test("button item should catch a custom validation group from Form", (assert) => {
        // arrange, act
        let $testContainer = $("#form");

        $testContainer.dxForm({
            validationGroup: "test",
            items: [{
                itemType: "button"
            }]
        });

        let buttonValidationGroup = $testContainer.find(".dx-button").dxButton("option", "validationGroup");

        // assert
        assert.equal(buttonValidationGroup, "test", "Button validationGroup is OK");
    });

    test("The name argument should be defined in the template of a simple item", (assert) => {
        const templateStub = sinon.stub();
        $("#form").dxForm({
            items: [{
                name: "TestName",
                template: templateStub
            }]
        });

        assert.equal(templateStub.getCall(0).args[0].name, "TestName", "name argument");
    });
});

QUnit.module("Grouping", () => {
    test("Render groups", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                formData: {
                    firstName: "John",
                    lastName: "Smith",
                    photo: "image.png",
                    address: {
                        city: "Test City",
                        room: 11,
                        house: 7,
                        street: "Test street"
                    }
                },
                items: [
                    {
                        itemType: "group",
                        items: [
                            {
                                dataField: "firstName"
                            },
                            {
                                dataField: "lastName"
                            }
                        ]
                    },
                    {
                        itemType: "group",
                        items: [
                            {
                                dataField: "photo"
                            }
                        ]
                    },
                    {
                        itemType: "group",
                        items: [
                            {
                                dataField: "address.city"
                            },
                            {
                                dataField: "address.street"
                            }
                        ]
                    }]
            }),
            $captions = $formContainer.find("." + internals.FORM_GROUP_CLASS + " ." + internals.FORM_GROUP_CAPTION_CLASS),
            $groups = $formContainer.find("." + internals.FORM_GROUP_CLASS),
            $labelTexts;

        // assert
        assert.equal($formContainer.find("." + internals.FIELD_ITEM_CONTENT_CLASS).eq(0).children().length, 1, "item content has only element with group");

        assert.equal($captions.length, 0, "captions count");
        assert.equal($groups.length, 3, "group elements count");
        assert.equal($groups.eq(0).find("." + internals.FIELD_ITEM_CLASS).length, 2, "group1 field items count");

        $labelTexts = $groups.eq(0).find("." + internals.FIELD_ITEM_LABEL_CONTENT_CLASS);
        assert.equal($labelTexts.eq(0).text(), "First Name:", "group1 label text 1");
        assert.equal($labelTexts.eq(1).text(), "Last Name:", "group1 label text 2");

        assert.equal($groups.eq(1).find("." + internals.FIELD_ITEM_CLASS).length, 1, "group2 field items count");
        $labelTexts = $groups.eq(1).find("." + internals.FIELD_ITEM_LABEL_CONTENT_CLASS);
        assert.equal($labelTexts.eq(0).text(), "Photo:", "group2 label text 1");

        assert.equal($groups.eq(2).find("." + internals.FIELD_ITEM_CLASS).length, 2, "group3 field items count");
        $labelTexts = $groups.eq(2).find("." + internals.FIELD_ITEM_LABEL_CONTENT_CLASS);
        assert.equal($labelTexts.eq(0).text(), "Address city:", "group3 label text 1");
        assert.equal($labelTexts.eq(1).text(), "Address street:", "group3 label text 2");
    });

    test("ColCount for groups", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                formData: {
                    firstName: "John",
                    lastName: "Smith",
                    photo: "image.png",
                    address: {
                        city: "Test City",
                        room: 11,
                        house: 7,
                        street: "Test street"
                    }
                },
                items: [
                    {
                        itemType: "group",
                        colCount: 3,
                        items: [
                            {
                                dataField: "firstName"
                            },
                            {
                                dataField: "lastName"
                            }
                        ]
                    },
                    {
                        itemType: "group",
                        items: [
                            {
                                dataField: "photo"
                            }
                        ]
                    },
                    {
                        itemType: "group",
                        colCount: 2,
                        items: [
                            {
                                dataField: "address.city"
                            },
                            {
                                dataField: "address.street"
                            }
                        ]
                    }]
            }),
            $layoutManagers = $formContainer.find("." + internals.FORM_GROUP_CLASS + " ." + internals.FORM_LAYOUT_MANAGER_CLASS);

        // assert
        assert.equal($layoutManagers.length, 3);
        assert.equal($layoutManagers.eq(0).dxLayoutManager("instance").option("colCount"), 3, "colCount from 1 layout manager");
        assert.equal($layoutManagers.eq(1).dxLayoutManager("instance").option("colCount"), 1, "colCount from 2 layout manager");
        assert.equal($layoutManagers.eq(2).dxLayoutManager("instance").option("colCount"), 2, "colCount from 3 layout manager");
    });

    test("Caption of group", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                formData: {
                    firstName: "John",
                    lastName: "Smith"
                },
                items: [
                    {
                        itemType: "group",
                        caption: "Personal",
                        items: [
                            {
                                dataField: "firstName"
                            },
                            {
                                dataField: "lastName"
                            }
                        ]
                    }]
            }),
            $captions = $formContainer.find("." + internals.FORM_GROUP_CLASS + " ." + internals.FORM_GROUP_CAPTION_CLASS);

        // assert
        assert.equal($captions.length, 1);
        assert.equal($captions.eq(0).text(), "Personal");
    });

    test("helpText element didn't render for group item", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                formData: {
                    firstName: "John"
                },
                items: [
                    {
                        itemType: "group",
                        caption: "Personal",
                        helpText: "Help Text",
                        items: [
                            {
                                dataField: "firstName"
                            }
                        ]
                    }]
            }),
            $helpTextElement = $formContainer.find("." + internals.FIELD_ITEM_HELP_TEXT_CLASS);

        // assert
        assert.equal($helpTextElement.length, 0, "There is no helpText element");
    });

    test("Group template", (assert) => {
        // arrange, act
        let $formContainer = $("#form").dxForm({
                formData: {
                    firstName: "John",
                    lastName: "Dow",
                    biography: "bla-bla-bla"
                },
                items: [
                    {
                        itemType: "group",
                        caption: "Personal info",
                        items: [
                            {
                                dataField: "firstName"
                            },
                            {
                                dataField: "lastName"
                            }
                        ]
                    },
                    {
                        itemType: "group",
                        caption: "Bio",
                        template: function(data, container) {
                            assert.deepEqual(typeUtils.isRenderer(container), !!config().useJQuery, "container is correct");
                            $("<div>")
                                .text(data.formData.biography)
                                .addClass("template-biography")
                                .appendTo(container);
                        }
                    }]
            }),
            $groups = $formContainer.find("." + internals.FORM_GROUP_CLASS);

        // assert
        assert.equal($groups.length, 2, "2 groups rendered");
        assert.equal($groups.eq(1).find(".template-biography").length, 1, "We have template content");
        assert.equal($groups.eq(1).find(".template-biography").text(), "bla-bla-bla", "Template's content has correct data");
    });

    test("Template has correct component instance", (assert) => {
        // arrange, act
        let templateOwnerComponent;

        $("#form").dxForm({
            items: [
                {
                    name: "test",
                    template: function(data, $container) {
                        templateOwnerComponent = data.component.NAME;
                    }
                }
            ]
        });

        // assert
        assert.equal(templateOwnerComponent, "dxForm", "Template's data.component is 'dxForm'");
    });

    test("Recursive grouping", (assert) => {
        // arrange, act
        let form = $("#form").dxForm({
                formData: {
                    firstName: "John",
                    lastName: "Dow",
                    biography: "bla-bla-bla",
                    photo: "test photo",
                    sex: true,
                    room: 1001,
                    city: "Tallinn"
                },
                items: [
                    {
                        itemType: "group",
                        items: [
                            {
                                itemType: "group",
                                caption: "Personal info",
                                items: ["firstName", "lastName"]
                            },
                            {
                                itemType: "group",
                                caption: "Description",
                                items: ["biography", "photo"]
                            }]
                    },
                    {
                        itemType: "group",
                        items: [
                            {
                                itemType: "group",
                                caption: "Sex",
                                items: ["sex"]
                            },
                            {
                                itemType: "group",
                                caption: "Address",
                                items: ["room", "city"]
                            }]
                    }
                ]
            }).dxForm("instance"),
            template = $("<div/>"),
            items = form._testResultItems;

        // assert
        items[0].template.render({
            model: {},
            container: template
        });
        assert.equal(template.find("> ." + internals.FORM_GROUP_CLASS).length, 1, "external group 1");
        template.empty();

        items[0].items[0].template.render({
            model: {},
            container: template
        });
        assert.equal(template.find("> ." + internals.FORM_GROUP_CLASS).length, 1, "external group 1 internal group 1");
        template.empty();

        items[0].items[1].template.render({
            model: {},
            container: template
        });
        assert.equal(template.find("> ." + internals.FORM_GROUP_CLASS).length, 1, "external group 1 internal group 2");
        template.empty();

        items[1].template.render({
            model: {},
            container: template
        });
        assert.equal(template.find("> ." + internals.FORM_GROUP_CLASS).length, 1, "external group 1");
        template.empty();

        items[1].items[0].template.render({
            model: {},
            container: template
        });
        assert.equal(template.find("> ." + internals.FORM_GROUP_CLASS).length, 1, "external group 2 internal group 1");
        template.empty();

        items[1].items[1].template.render({
            model: {},
            container: template
        });
        assert.equal(template.find("> ." + internals.FORM_GROUP_CLASS).length, 1, "external group 2 internal group 2");
        template.empty();

        template.remove();
    });

    test("Hide nested group item", (assert) => {
        // arrange
        let $formContainer = $("#form").dxForm({
                formData: {
                    photo: "image.png",
                    address: {
                        city: "Test City",
                        street: "Test street"
                    }
                },
                items: [
                    {
                        itemType: "group",
                        items: [
                            {
                                itemType: "group",
                                items: ["photo"]
                            },
                            {
                                itemType: "group",
                                items: ["address.city", "address.street"]
                            }
                        ]
                    }
                ]
            }),
            form = $formContainer.dxForm("instance");

        // act
        let $formGroups = $formContainer.find("." + internals.FORM_GROUP_CLASS);

        // assert
        assert.equal($formGroups.length, 3, "3 groups were rendered");

        // act
        let changeItemOptionSpy = sinon.spy(form, "_changeItemOption");
        form.option("items[0].items[1].visible", false);
        $formGroups = $formContainer.find("." + internals.FORM_GROUP_CLASS);

        // assert
        assert.equal($formGroups.length, 2, "Two groups were rendered");
        assert.equal(changeItemOptionSpy.args[0][1], "visible", "option's name is correct");
        assert.equal(changeItemOptionSpy.args[0][2], false, "option's value is correct");
    });
});

QUnit.module("Tabs", {
    beforeEach: () => {
        let that = this;
        that.clock = sinon.useFakeTimers();

        responsiveBoxScreenMock.setup.call(this, 1200);
    },

    afterEach: () => {
        this.clock.restore();
        responsiveBoxScreenMock.teardown.call(this);
    }
}, () => {
    test("Render tabs", (assert) => {
        // arrange, act
        let testContainer = $("#form");

        testContainer.dxForm({
            formData: {
                firstName: "John",
                lastName: "Smith",
                sex: true,
                order: 101,
                photo: "image.png",
                address: {
                    city: "Test City",
                    room: 11,
                    house: 7,
                    street: "Test street"
                }
            },
            items: [
                {
                    itemType: "group",
                    colCount: 2,
                    items: ["firstName", "lastName"]
                },
                {
                    itemType: "tabbed",
                    tabPanelOptions: { animationEnabled: true, deferRendering: windowUtils.hasWindow() ? true : false },
                    tabs: [
                        {
                            title: "Address1",
                            items: ["address.city", "address.street"]
                        },
                        {
                            title: "Address2",
                            items: ["address.room", "address.house"]
                        }]
                }]
        });

        let tabPanelItems,
            tabPanel = $(".dx-tabpanel").dxTabPanel("instance");

        // assert
        tabPanelItems = tabPanel.option("items");
        assert.equal(tabPanel.option("animationEnabled"), true, "tab panel option");
        assert.equal(tabPanelItems.length, 2, "items count in tab panel");
        assert.equal(tabPanelItems[0].title, "Address1", "title of tab 1");
        assert.equal(tabPanelItems[1].title, "Address2", "title of tab 2");
        assert.notEqual(testContainer.find(".dx-multiview-item ." + internals.FORM_LAYOUT_MANAGER_CLASS).length, 0, "layout manager inside multiview item");
    });

    test("Render tabs with groups", (assert) => {
        // arrange, act
        let clock = sinon.useFakeTimers();
        let testContainer = $("#form");

        testContainer.dxForm({
            formData: {
                firstName: "John",
                lastName: "Smith",
                order: 101,
                photo: "image.png",
                address: {
                    city: "Test City",
                    room: 11,
                    house: 7,
                    street: "Test street"
                }
            },
            items: [
                {
                    itemType: "tabbed",
                    tabPanelOptions: { deferRendering: windowUtils.hasWindow() ? true : false },
                    tabs: [
                        {
                            title: "Other1",
                            items: [{
                                itemType: "group",
                                colCount: 2,
                                items: ["firstName", "lastName"]
                            }, {
                                itemType: "group",
                                items: ["address.city", "address.street"]
                            }]
                        },
                        {
                            title: "Other2",
                            items: [{
                                itemType: "group",
                                colCount: 2,
                                items: ["address.room", "address.house"]
                            }]
                        }]
                }],
        });

        clock.tick();
        let $groups = testContainer.find(".dx-item-selected " + "." + internals.FORM_GROUP_CLASS);

        // assert
        assert.equal($groups.length, 2);
        assert.equal($groups.eq(0).find("." + internals.FIELD_ITEM_CLASS).length, 2, "group 1");
        assert.equal($groups.eq(1).find("." + internals.FIELD_ITEM_CLASS).length, 2, "group 2");

        // act
        testContainer.find(".dx-tabpanel").dxTabPanel("instance").option("selectedIndex", 1);
        $groups = testContainer.find(".dx-item-selected " + "." + internals.FORM_GROUP_CLASS);
        assert.equal($groups.eq(0).find("." + internals.FIELD_ITEM_CLASS).length, 2, "group 1");

        // assert
        assert.notEqual($groups.length, 0);
        clock.restore();
    });

    test("tabElement argument of tabTemplate option is correct", (assert) => {
        let testContainer = $("#form");
        testContainer.dxForm({
            formData: {
                firstName: ""
            },
            items: [
                {
                    itemType: "tabbed",
                    tabPanelOptions: { deferRendering: windowUtils.hasWindow() ? true : false },
                    tabs: [
                        {
                            items: ["firstName"],
                            tabTemplate: function(tabData, tabIndex, tabElement) {
                                assert.equal(typeUtils.isRenderer(tabElement), !!config().useJQuery, "tabElement is correct");
                            }
                        }]
                }]
        });
    });
});
