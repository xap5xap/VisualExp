import { Tooltip } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { FC, useEffect, useState } from "react";

import { NodeType } from "../src/knowledgeTypes";
import NodeTypeIcon from "./NodeTypeIcon";

type Props = {
  nodeTypes: string[];
  onNodesTypeChange: (newValues: string[]) => void;
};

const options: NodeType[] = [
  NodeType.Advertisement,
  NodeType.Code,
  NodeType.Concept,
  NodeType.Idea,
  NodeType.News,
  NodeType.Private,
  NodeType.Profile,
  NodeType.Question,
  NodeType.Reference,
  NodeType.Relation,
  NodeType.Sequel,
  NodeType.Tag
];

const NodeTypesAutocomplete: FC<Props> = ({ onNodesTypeChange, nodeTypes }) => {
  const [value, setValue] = useState<string[]>([]);
  const [hasBeenCleared, setHasBeenCleared] = useState(false);

  const handleChange = (_: React.SyntheticEvent, newValue: string[]) => {
    if (newValue.length === 0) {
      setHasBeenCleared(true);
    }
    setValue(newValue);
    onNodesTypeChange(newValue);
  };

  useEffect(() => {
    if (value.length === 0 && nodeTypes.length > 0 && !hasBeenCleared) {
      setValue(nodeTypes);
    }
  }, [nodeTypes, hasBeenCleared, value.length]);

  return (
    <Tooltip title="There are six different types of nodes on 1Cademy: concept, relation, question, code, reference, and idea. You can tell the type of node by looking at the icon at the bottom-right corner of each node.">
      <Autocomplete
        multiple
        options={options}
        value={value}
        renderOption={(props, option) => (
          <li {...props}>
            {<NodeTypeIcon sx={{ mr: 1 }} nodeType={option as NodeType} />}
            {option}
          </li>
        )}
        getOptionLabel={option => option}
        onChange={handleChange}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option, index: number) => (
            <Chip
              icon={<NodeTypeIcon color="primary" nodeType={option as NodeType} />}
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              key={index}
            />
          ))
        }
        renderInput={params => <TextField {...params} variant="outlined" label="Node types" />}
      />
    </Tooltip>
  );
};
export default NodeTypesAutocomplete;
