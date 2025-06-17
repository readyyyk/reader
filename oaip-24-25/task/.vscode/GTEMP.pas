program solve;

const
  MAX_DAY = 366;
  MAX_NAME_LEN = 50;
  N = 3;

type
  TS = string[MAX_NAME_LEN];
  TR = record
    a: integer;
    a2: integer;
    b: TS;
    b2: TS;
  end;
  TRA = array of TR;

function fx(arr: TRA): TR;
var
  _max, i: integer;
  cnt: array of integer;
  _maxp: TR;
begin
  setlength(cnt, MAX_DAY + 1);
  _max := 0;
  for i := 0 to MAX_DAY do begin
    cnt[i] := 0;
  end;
  for i := low(arr) to high(arr) do begin
    inc(cnt[arr[i].a]);
    if _max < cnt[arr[i].a] then begin
      _max := cnt[arr[i].a];
      _maxp := arr[i];
    end;
  end;
  result := _maxp;
end;

var
  f: textfile;
  i: integer;
  arr: TRA;
  res: TR;
begin
  setlength(arr, N);
  assign(f, 'input.txt');
  reset(f);
  for i := 0 to N-1 do begin
    readln(f, arr[i].b);
    readln(f, arr[i].b2);
    read(f, arr[i].a);
    read(f, arr[i].a2);
    readln(f);
  end;
  close(f);

  res := fx(arr);
  writeln('a: ', res.a);
  writeln('b: ', res.b);
end.
