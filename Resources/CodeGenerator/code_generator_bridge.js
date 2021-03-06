/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CodeGeneratorBridge = {};

// Dictionary mapping block types to a custom `domToMutation(xmlElement)` function. The function
// is added to the block definition of its mapped type and is called when the block is being
// initialized from XML data.
CodeGeneratorBridge.BlockDomToMutation = {};

CodeGeneratorBridge.initFactory = function(block) {
  return function() {
    this.jsonInit(block);
  };
};

CodeGeneratorBridge.domToMutationFactory = function(block) {
  return CodeGeneratorBridge.BlockDomToMutation[block.type];
};

CodeGeneratorBridge.importBlockDefinitions = function(definitions) {
  if (!!definitions) {
    var jsonArr = JSON.parse(definitions);
    for (var index = 0; index < jsonArr.length; index++) {
      var block = jsonArr[index];
      Blockly.Blocks[block.type] = {
        init: CodeGeneratorBridge.initFactory(block),
        domToMutation: CodeGeneratorBridge.domToMutationFactory(block)
      };
    }
  }
};

CodeGeneratorBridge.generateCodeForWorkspace = function(workspaceXML, generator) {
  try {
    // Parse the XML into a tree.
    var dom = Blockly.Xml.textToDom(workspaceXML);

    // Create a headless workspace.
    var workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(workspace, dom);

    // Generate the code
    var code = generator.workspaceToCode(workspace);

    // Clear workspace (this will clear any global state that was set)
    workspace.clear();

    // Send success message to iOS
    window.webkit.messageHandlers.CodeGenerator.postMessage(
        {method: "generateCodeForWorkspace", code: code});
  } catch (error) {
    // Send failure message to iOS
    window.webkit.messageHandlers.CodeGenerator.postMessage(
        {method: "generateCodeForWorkspace", error: error});
  }
};
